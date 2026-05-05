
export interface Item {
    id: string;
    name: string;
    imageUrl?: string | null;
    note?: string | null;
    parentId: string | null;
    projectId: string; // New field
    createdAt?: string; // Changed to string for timestamp compatibility, optional for legacy
}

export interface Project {
    id: string;
    name: string;
    ownerId: string;
    createdAt: string;
}

export interface UserProfile {
    id: string;
    email?: string;
}

export interface Share {
    id: string;
    token: string;
    itemId: string;
    projectId: string;
    createdAt: string;
}

export type ViewMode = 'hierarchy' | 'flat';
