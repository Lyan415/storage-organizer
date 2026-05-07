import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { ItemCard } from '../components/ItemCard';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ItemDetailModal } from '../components/ItemDetailModal';
import { ArrowLeft, Trash2 } from 'lucide-react';
import type { Item } from '../types';

export const HierarchyView: React.FC = () => {
    const { currentFolderId, getItemsInFolder, navigateToFolder, navigateBack, deleteItem } = useStore();
    const [detailItem, setDetailItem] = useState<Item | null>(null);

    const items = getItemsInFolder(currentFolderId);
    const currentItem = useStore(state => state.getItem(currentFolderId || ''));

    const handleItemClick = (item: Item) => {
        navigateToFolder(item.id);
    };

    const handleItemLongPress = (item: Item) => {
        setDetailItem(item);
    };

    const handleDelete = () => {
        if (currentFolderId && window.confirm('Are you sure you want to delete this folder and all its contents?')) {
            deleteItem(currentFolderId);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
                <Breadcrumbs />
            </div>

            {currentFolderId && (
                <div className="mb-4 flex items-center gap-2 px-1">
                    <button onClick={navigateBack} className="p-1 text-gray-600">
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800 truncate flex-1">
                        {currentItem?.name || 'Folder'}
                    </h2>
                    <button
                        onClick={handleDelete}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete Folder"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            )}

            {items.length === 0 ? (
                <div className="mt-10 flex flex-col items-center justify-center text-gray-400">
                    <p>Empty folder</p>
                    <p className="text-sm">Tap + to add items</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {items.map((item) => (
                        <ItemCard
                            key={item.id}
                            item={item}
                            onClick={handleItemClick}
                            onLongPress={handleItemLongPress}
                        />
                    ))}
                </div>
            )}

            <ItemDetailModal
                item={detailItem}
                onClose={() => setDetailItem(null)}
            />
        </div>
    );
};
