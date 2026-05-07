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
        <div className="flex h-[100dvh] flex-col bg-gray-50">
            {/* Top Bar */}
            <header className="flex-shrink-0 flex h-14 items-center justify-between border-b border-gray-100 bg-white px-4">
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
            <main className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav className="flex-shrink-0 bg-white pb-safe">
                {/* Add button row */}
                <div className="flex justify-center border-t border-gray-100 pt-2">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 shadow-lg shadow-blue-600/30 transition-transform active:scale-95 text-white"
                    >
                        <Plus size={26} />
                    </button>
                </div>
                {/* Nav buttons row */}
                <div className="flex h-12 items-center justify-around px-2">
                    <button
                        onClick={() => setViewMode('hierarchy')}
                        className={clsx(
                            "flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition-colors",
                            viewMode === 'hierarchy' ? "text-blue-600" : "text-gray-400"
                        )}
                    >
                        <Network size={22} />
                        <span className="text-[10px] font-medium">Browse</span>
                    </button>

                    <button
                        onClick={() => setViewMode('flat')}
                        className={clsx(
                            "flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition-colors",
                            viewMode === 'flat' ? "text-blue-600" : "text-gray-400"
                        )}
                    >
                        <LayoutGrid size={22} />
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
