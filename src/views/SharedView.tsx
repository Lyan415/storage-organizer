import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Item } from '../types';
import { ChevronRight, Home, Package, ArrowLeft } from 'lucide-react';

export const SharedView: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const [items, setItems] = useState<Item[]>([]);
    const [rootItem, setRootItem] = useState<Item | null>(null);
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [history, setHistory] = useState<(string | null)[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);

    useEffect(() => {
        if (!token) return;

        const loadSharedData = async () => {
            setLoading(true);
            setError(null);

            const { data: share, error: shareError } = await supabase
                .from('shares')
                .select('*')
                .eq('token', token)
                .single();

            if (shareError || !share) {
                setError('This share link is invalid or has expired.');
                setLoading(false);
                return;
            }

            const { data: allItems, error: itemsError } = await supabase
                .from('items')
                .select('*')
                .eq('project_id', share.project_id);

            if (itemsError) {
                setError('Failed to load shared items.');
                setLoading(false);
                return;
            }

            const mapped: Item[] = (allItems || []).map((i: any) => ({
                id: i.id,
                name: i.name,
                imageUrl: i.image_url,
                note: i.note,
                parentId: i.parent_id,
                projectId: i.project_id,
                createdAt: i.created_at,
            }));

            const root = mapped.find(i => i.id === share.item_id) || null;
            setRootItem(root);
            setItems(mapped);
            setCurrentFolderId(share.item_id);
            setLoading(false);
        };

        loadSharedData();
    }, [token]);

    const getChildren = (parentId: string | null) =>
        items.filter(i => i.parentId === parentId);

    const getPath = (itemId: string | null): Item[] => {
        const path: Item[] = [];
        let current = items.find(i => i.id === itemId);
        while (current && current.id !== rootItem?.id) {
            path.unshift(current);
            current = current.parentId ? items.find(i => i.id === current!.parentId) : undefined;
        }
        return path;
    };

    const navigateTo = (folderId: string | null) => {
        setHistory(prev => [...prev, currentFolderId]);
        setCurrentFolderId(folderId);
        setSelectedItem(null);
    };

    const navigateBack = () => {
        if (history.length === 0) return;
        const prev = history[history.length - 1];
        setHistory(h => h.slice(0, -1));
        setCurrentFolderId(prev);
        setSelectedItem(null);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-gray-500">Loading shared items...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-gray-50 px-4">
                <Package className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-600 text-center">{error}</p>
            </div>
        );
    }

    const currentChildren = getChildren(currentFolderId);
    const currentItem = items.find(i => i.id === currentFolderId);
    const pathFromRoot = getPath(currentFolderId);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
                <div className="max-w-2xl mx-auto px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Package size={14} />
                        Shared View
                    </div>
                    <div className="flex items-center gap-2">
                        {currentFolderId !== rootItem?.id && (
                            <button
                                onClick={navigateBack}
                                className="p-1.5 -ml-1.5 text-gray-600 hover:bg-gray-100 rounded-full"
                            >
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        <h1 className="text-lg font-semibold text-gray-900 truncate">
                            {currentItem?.name || 'Shared Items'}
                        </h1>
                    </div>

                    {/* Breadcrumbs */}
                    {pathFromRoot.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 mt-2 text-xs text-gray-500">
                            <button
                                onClick={() => { setHistory([]); setCurrentFolderId(rootItem?.id || null); }}
                                className="flex items-center text-blue-600 hover:underline px-1 py-0.5 rounded"
                            >
                                <Home size={12} className="mr-0.5" />
                                {rootItem?.name}
                            </button>
                            {pathFromRoot.map(p => (
                                <React.Fragment key={p.id}>
                                    <ChevronRight size={12} className="text-gray-400" />
                                    <button
                                        onClick={() => navigateTo(p.id)}
                                        className="text-blue-600 hover:underline px-1 py-0.5 rounded truncate max-w-[80px]"
                                    >
                                        {p.name}
                                    </button>
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Current item detail */}
            {currentItem?.imageUrl && !selectedItem && (
                <div className="max-w-2xl mx-auto px-4 pt-4">
                    <div className="rounded-xl overflow-hidden bg-gray-100 h-48 relative">
                        <img
                            src={currentItem.imageUrl}
                            alt={currentItem.name}
                            className="absolute inset-0 w-full h-full object-cover opacity-30 blur-xl scale-110"
                        />
                        <img
                            src={currentItem.imageUrl}
                            alt={currentItem.name}
                            className="relative h-full w-full object-contain z-10"
                        />
                    </div>
                    {currentItem.note && (
                        <p className="mt-2 text-sm text-gray-600">{currentItem.note}</p>
                    )}
                </div>
            )}

            {/* Children grid */}
            <div className="max-w-2xl mx-auto px-4 py-4">
                {currentChildren.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <Package size={48} className="mx-auto mb-3 opacity-50" />
                        <p>No items inside</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {currentChildren.map(child => (
                            <button
                                key={child.id}
                                onClick={() => {
                                    const hasChildren = items.some(i => i.parentId === child.id);
                                    if (hasChildren) {
                                        navigateTo(child.id);
                                    } else {
                                        setSelectedItem(selectedItem?.id === child.id ? null : child);
                                    }
                                }}
                                className="rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left"
                            >
                                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                                    {child.imageUrl ? (
                                        <>
                                            <img
                                                src={child.imageUrl}
                                                alt=""
                                                className="absolute inset-0 w-full h-full object-cover opacity-30 blur-xl scale-110"
                                            />
                                            <img
                                                src={child.imageUrl}
                                                alt={child.name}
                                                className="relative h-full w-full object-contain z-10"
                                            />
                                        </>
                                    ) : (
                                        <div className="flex h-full items-center justify-center">
                                            <Package size={32} className="text-gray-300" />
                                        </div>
                                    )}
                                    {items.some(i => i.parentId === child.id) && (
                                        <div className="absolute top-2 right-2 z-20 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                            {items.filter(i => i.parentId === child.id).length}
                                        </div>
                                    )}
                                </div>
                                <div className="px-3 py-2">
                                    <p className="text-sm font-medium text-gray-900 truncate">{child.name}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Selected item detail overlay */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={() => setSelectedItem(null)}
                >
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {selectedItem.imageUrl && (
                            <div className="h-64 bg-gray-100 relative overflow-hidden">
                                <img src={selectedItem.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 blur-xl scale-110" />
                                <img src={selectedItem.imageUrl} alt={selectedItem.name} className="relative h-full w-full object-contain z-10" />
                            </div>
                        )}
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-900">{selectedItem.name}</h2>
                            {selectedItem.note && (
                                <p className="mt-2 text-gray-600">{selectedItem.note}</p>
                            )}
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="mt-4 w-full py-2 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
