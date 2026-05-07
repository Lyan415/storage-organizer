import React, { useState } from 'react';
import { LayoutGrid, Network, Plus, Search, LogOut } from 'lucide-react';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { AddItemModal } from '../components/AddItemModal';
import { SearchModal } from '../components/SearchModal';
import { clsx } from 'clsx';

interface MobileLayoutProps {
    children: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
    const { viewMode, setViewMode } = useStore();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <div className="flex h-screen flex-col bg-gray-50">
            {/* Top Bar - Simplified for now */}
            <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-gray-100 bg-white/80 px-4 backdrop-blur-md">
                <h1 className="text-lg font-bold text-gray-900">
                    {viewMode === 'hierarchy' ? 'My Space' : 'All Items'}
                </h1>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
                    >
                        <Search size={22} />
                    </button>
                    <button
                        onClick={() => supabase.auth.signOut()}
                        className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-red-500"
                        title="登出"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-4 pb-48 scrollbar-hide">
                {children}
            </main>

            {/* Floating Action Button (FAB) - Centered */}
            <div className="fixed bottom-6 left-1/2 z-20 -translate-x-1/2 transform">
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg shadow-blue-600/30 transition-transform active:scale-95 text-white"
                >
                    <Plus size={28} />
                </button>
            </div>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 z-10 w-full border-t border-gray-100 bg-white pb-safe">
                <div className="flex h-16 items-center justify-around px-2">
                    <button
                        onClick={() => setViewMode('hierarchy')}
                        className={clsx(
                            "flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-colors",
                            viewMode === 'hierarchy' ? "text-blue-600" : "text-gray-400"
                        )}
                    >
                        <Network size={24} />
                        <span className="text-[10px] font-medium">Browse</span>
                    </button>

                    <div className="w-12" /> {/* Spacer for FAB */}

                    <button
                        onClick={() => setViewMode('flat')}
                        className={clsx(
                            "flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-colors",
                            viewMode === 'flat' ? "text-blue-600" : "text-gray-400"
                        )}
                    >
                        <LayoutGrid size={24} />
                        <span className="text-[10px] font-medium">Grid</span>
                    </button>
                </div>
            </nav>

            <AddItemModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />

            <SearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
            />
        </div>
    );
};
