
import { create } from 'zustand';
import type { Item, ViewMode, Project } from '../types';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface StoreState {
    user: User | null;
    projects: Project[];
    items: Item[];
    currentProjectId: string | null;
    currentFolderId: string | null;
    viewMode: ViewMode;
    history: (string | null)[];
    isLoading: boolean;

    // Actions
    setUser: (user: User | null) => void;

    // Project Actions
    fetchProjects: () => Promise<void>;
    createProject: (name: string) => Promise<void>;
    updateProject: (projectId: string, name: string) => Promise<void>;
    deleteProject: (projectId: string) => Promise<void>;
    setCurrentProject: (projectId: string | null) => void;

    // Item Actions
    fetchItems: (projectId: string) => Promise<void>;
    addItem: (item: Omit<Item, 'id' | 'createdAt'>) => Promise<void>;
    deleteItem: (itemId: string) => Promise<void>;
    moveItem: (itemId: string, newParentId: string | null) => Promise<void>;
    updateItem: (itemId: string, updates: Partial<Omit<Item, 'id' | 'createdAt' | 'projectId'>>) => Promise<void>;

    // Share Actions
    createShare: (itemId: string, projectId: string) => Promise<string>;
    deleteShare: (shareId: string) => Promise<void>;

    // Navigation
    setViewMode: (mode: ViewMode) => void;
    navigateToFolder: (folderId: string | null) => void;
    navigateBack: () => void;

    // Selectors (internal usage mostly, but exposed if needed)
    getItemsInFolder: (folderId: string | null) => Item[];
    getParent: (itemId: string) => Item | undefined;
    getItem: (itemId: string) => Item | undefined;
    getPath: (itemId: string) => Item[];
}

export const useStore = create<StoreState>((set, get) => ({
    user: null,
    projects: [],
    items: [],
    currentProjectId: null,
    currentFolderId: null,
    viewMode: 'hierarchy',
    history: [],
    isLoading: false,

    setUser: (user) => set({ user }),

    fetchProjects: async () => {
        set({ isLoading: true });
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching projects:', error);
        } else {
            // Map Supabase specific fields to camelCase if needed, or keep snake_case
            // For now assuming we adjust types or mapping
            const mappedProjects: Project[] = (data || []).map((p: any) => ({
                id: p.id,
                name: p.name,
                ownerId: p.owner_id,
                createdAt: p.created_at
            }));
            set({ projects: mappedProjects });
        }
        set({ isLoading: false });
    },

    createProject: async (name) => {
        const user = get().user;
        if (!user) return;

        const { data, error } = await supabase
            .from('projects')
            .insert({ name, owner_id: user.id })
            .select() // Need to select to get ID
            .single();

        if (error) {
            console.error('Error creating project:', error);
        } else if (data) {
            const newProject: Project = {
                id: data.id,
                name: data.name,
                ownerId: data.owner_id,
                createdAt: data.created_at
            };
            set((state) => ({ projects: [newProject, ...state.projects] }));
        }
    },

    updateProject: async (projectId, name) => {
        const prev = get().projects;
        set(state => ({
            projects: state.projects.map(p => p.id === projectId ? { ...p, name } : p)
        }));
        const { error } = await supabase
            .from('projects')
            .update({ name })
            .eq('id', projectId);
        if (error) {
            console.error('Error updating project:', error);
            set({ projects: prev });
        }
    },

    deleteProject: async (projectId) => {
        const prev = get().projects;
        set(state => ({ projects: state.projects.filter(p => p.id !== projectId) }));
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', projectId);
        if (error) {
            console.error('Error deleting project:', error);
            set({ projects: prev });
        }
    },

    setCurrentProject: (projectId) => {
        set({ currentProjectId: projectId, currentFolderId: null, history: [], items: [] });
        if (projectId) {
            get().fetchItems(projectId);
        }
    },

    fetchItems: async (projectId) => {
        set({ isLoading: true });
        const { data, error } = await supabase
            .from('items')
            .select('*')
            .eq('project_id', projectId);

        if (error) {
            console.error('Error fetching items:', error);
        } else {
            const mappedItems: Item[] = (data || []).map((i: any) => ({
                id: i.id,
                name: i.name,
                imageUrl: i.image_url,
                note: i.note,
                parentId: i.parent_id,
                projectId: i.project_id,
                createdAt: i.created_at
            }));
            set({ items: mappedItems });
        }
        set({ isLoading: false });
    },

    addItem: async (itemPayload) => {
        const projectId = get().currentProjectId;
        if (!projectId) return;

        // Optimistic Update
        const tempId = crypto.randomUUID();
        const optimisticItem: Item = {
            ...itemPayload,
            id: tempId,
            projectId,
            createdAt: new Date().toISOString()
        };

        set((state) => ({ items: [...state.items, optimisticItem] }));

        // DB Call
        const { data, error } = await supabase
            .from('items')
            .insert({
                name: itemPayload.name,
                image_url: itemPayload.imageUrl,
                note: itemPayload.note,
                parent_id: itemPayload.parentId,
                project_id: projectId
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding item:', error);
            // Revert optimistic update
            set((state) => ({ items: state.items.filter(i => i.id !== tempId) }));
        } else if (data) {
            // Replace optimistic item with real one
            set((state) => ({
                items: state.items.map(i => i.id === tempId ? {
                    id: data.id,
                    name: data.name,
                    imageUrl: data.image_url,
                    note: data.note,
                    parentId: data.parent_id,
                    projectId: data.project_id,
                    createdAt: data.created_at
                } : i)
            }));
        }
    },

    deleteItem: async (itemId) => {
        const previousItems = get().items;

        // Optimistic Delete (including descendants)
        const getDescendants = (id: string, allItems: Item[]): string[] => {
            const children = allItems.filter(i => i.parentId === id);
            let descendants = children.map(c => c.id);
            children.forEach(child => {
                descendants = [...descendants, ...getDescendants(child.id, allItems)];
            });
            return descendants;
        };

        const descendants = getDescendants(itemId, previousItems);
        const idsToDelete = [itemId, ...descendants];

        // Check if we need to navigate up
        let newCurrentFolderId = get().currentFolderId;
        if (newCurrentFolderId && idsToDelete.includes(newCurrentFolderId)) {
            newCurrentFolderId = null;
        }

        set((state) => ({
            items: state.items.filter(i => !idsToDelete.includes(i.id)),
            currentFolderId: newCurrentFolderId
        }));

        // DB Call
        const { error } = await supabase
            .from('items')
            .delete()
            .in('id', idsToDelete);

        if (error) {
            console.error('Error deleting item:', error);
            set({ items: previousItems }); // Revert
        }
    },

    moveItem: async (itemId, newParentId) => {
        const previousItems = get().items;

        // Validation
        if (itemId === newParentId) return;

        // Optimistic
        set((state) => ({
            items: state.items.map(item =>
                item.id === itemId ? { ...item, parentId: newParentId } : item
            )
        }));

        // DB Call
        const { error } = await supabase
            .from('items')
            .update({ parent_id: newParentId })
            .eq('id', itemId);

        if (error) {
            console.error('Error moving item:', error);
            set({ items: previousItems });
        }
    },

    updateItem: async (itemId, updates) => {
        const previousItems = get().items;

        // Optimistic Update
        set((state) => ({
            items: state.items.map(item =>
                item.id === itemId ? { ...item, ...updates } : item
            )
        }));

        // DB Call
        // Map camelCase to snake_case for DB
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
        if (updates.note !== undefined) dbUpdates.note = updates.note;
        if (updates.parentId !== undefined) dbUpdates.parent_id = updates.parentId; // unexpected but possible

        const { error } = await supabase
            .from('items')
            .update(dbUpdates)
            .eq('id', itemId);

        if (error) {
            console.error('Error updating item:', error);
            set({ items: previousItems });
        }
    },

    createShare: async (itemId, projectId) => {
        const token = crypto.randomUUID().replace(/-/g, '').substring(0, 16);
        const { data, error } = await supabase
            .from('shares')
            .insert({ token, item_id: itemId, project_id: projectId })
            .select()
            .single();

        if (error) {
            console.error('Error creating share:', error);
            throw error;
        }
        return data.token;
    },

    deleteShare: async (shareId) => {
        const { error } = await supabase
            .from('shares')
            .delete()
            .eq('id', shareId);
        if (error) {
            console.error('Error deleting share:', error);
        }
    },

    setViewMode: (mode) => set({ viewMode: mode }),

    navigateToFolder: (folderId) =>
        set((state) => ({
            currentFolderId: folderId,
            history: [...state.history, state.currentFolderId]
        })),

    navigateBack: () => set((state) => {
        if (state.history.length === 0) return {};
        const previous = state.history[state.history.length - 1];
        return {
            currentFolderId: previous,
            history: state.history.slice(0, -1)
        };
    }),

    getItemsInFolder: (folderId) => {
        return get().items.filter(item => item.parentId === folderId);
    },

    getParent: (itemId) => {
        const item = get().items.find(i => i.id === itemId);
        if (!item || !item.parentId) return undefined;
        return get().items.find(i => i.id === item.parentId);
    },

    getItem: (itemId) => get().items.find(i => i.id === itemId),

    getPath: (itemId) => {
        const path: Item[] = [];
        let current = get().items.find(i => i.id === itemId);
        while (current) {
            if (current.parentId) {
                const parent = get().items.find(i => i.id === current!.parentId);
                if (parent) {
                    path.unshift(parent);
                    current = parent;
                } else {
                    current = undefined;
                }
            } else {
                current = undefined;
            }
        }
        return path;
    }
}));
