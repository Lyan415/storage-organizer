import React, { useState } from 'react';
import { X, MapPin, Trash2, Move, ChevronRight, Home, Edit2, Share2, Check, Link, Sparkles, Loader2 } from 'lucide-react';
import type { Item } from '../types';
import { useStore } from '../store/useStore';
import { uploadImage } from '../lib/imageUpload';
import { getAIConfig } from '../lib/aiConfig';
import { recognizeImage } from '../lib/aiRecognition';
import { FolderPicker } from './FolderPicker';

interface ItemDetailModalProps {
    item: Item | null;
    onClose: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, onClose }) => {
    const { getPath, navigateToFolder, setViewMode, deleteItem, moveItem, updateItem, createShare } = useStore();
    const [isMovePickerOpen, setIsMovePickerOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editNote, setEditNote] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const [shareCopied, setShareCopied] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isRecognizing, setIsRecognizing] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    // Reset state when item changes or modal opens
    React.useEffect(() => {
        if (item) {
            setEditName(item.name);
            setEditNote(item.note || '');
            setPreviewUrl(null);
            setIsEditing(false);
            setShareUrl(null);
            setShareCopied(false);
            setSelectedFile(null);
            setAiError(null);
        }
    }, [item]);

    if (!item) return null;

    const path = getPath(item.id);

    const handleNavigateToFolder = (folderId: string | null) => {
        navigateToFolder(folderId);
        setViewMode('hierarchy');
        onClose();
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
            deleteItem(item.id);
            onClose();
        }
    };

    const handleMove = (newParentId: string | null) => {
        moveItem(item.id, newParentId);
        setIsMovePickerOpen(false);
        onClose();
    };

    const handleShare = async () => {
        if (shareUrl) {
            await navigator.clipboard.writeText(shareUrl);
            setShareCopied(true);
            setTimeout(() => setShareCopied(false), 2000);
            return;
        }
        try {
            const token = await createShare(item.id, item.projectId);
            const url = `${window.location.origin}${import.meta.env.BASE_URL}share/${token}`;
            setShareUrl(url);
            await navigator.clipboard.writeText(url);
            setShareCopied(true);
            setTimeout(() => setShareCopied(false), 2000);
        } catch {
            alert('Failed to create share link.');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setAiError(null);
        }
    };

    const handleAIRecognize = async () => {
        if (!selectedFile) return;
        setIsRecognizing(true);
        setAiError(null);
        try {
            const result = await recognizeImage(selectedFile);
            setEditName(result);
        } catch (err: any) {
            setAiError(err.message || 'AI 辨識失敗');
        } finally {
            setIsRecognizing(false);
        }
    };

    const handleSave = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            let imageUrl = item.imageUrl;

            // Check for file selection
            const fileInput = document.getElementById('edit-item-file-input') as HTMLInputElement;

            if (fileInput?.files?.[0]) {
                imageUrl = await uploadImage(fileInput.files[0]);
            } else if (previewUrl && !previewUrl.startsWith('blob:')) {
                // If previewUrl is a real URL (not blob), use it
                imageUrl = previewUrl;
            }

            await updateItem(item.id, {
                name: editName,
                note: editNote,
                imageUrl: imageUrl,
            });

            // Success flow
            setIsEditing(false);

            // Optional: Close modal on save for better UX, or just exit edit mode?
            // User reported app freeze, simplest fix is to ensure we are in a clean state.
            // Let's exit edit mode and ensure submitting is false.

        } catch (error) {
            console.error('Failed to update item:', error);
            alert('Failed to update item. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">

                {/* Close Button - Moved outside relative container to ensure it's on top of everything */}
                <button
                    onClick={() => {
                        console.log('Close button clicked');
                        if (!isSubmitting) onClose();
                    }}
                    disabled={isSubmitting}
                    className={`absolute right-4 top-4 z-[60] rounded-full p-2 text-white/80 hover:text-white transition-colors ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'hover:bg-white/10'}`}
                    style={{ position: 'fixed', top: '16px', right: '16px' }} // Force fixed position on screen
                >
                    <X size={32} /> {/* Made bigger */}
                </button>

                <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                    {/* Hero Image - Fixed Display */}
                    <div className="h-64 w-full bg-gray-100 flex-shrink-0 relative group overflow-hidden">
                        {/* Blurred Background */}
                        <img
                            src={previewUrl || item.imageUrl || ''}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover opacity-30 blur-xl scale-110"
                        />
                        {/* Main Image - Contain */}
                        <img
                            src={previewUrl || item.imageUrl || ''}
                            alt={item.name}
                            className="relative h-full w-full object-contain z-10"
                        />

                        {isEditing && (
                            <label className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="bg-white/90 text-black px-4 py-2 rounded-full text-sm font-medium">
                                    Change Photo
                                </span>
                                <input
                                    id="edit-item-file-input"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto">
                        <div className="flex items-start justify-between mb-4">
                            {isEditing ? (
                                <div className="w-full mr-4">
                                    <label className="text-xs text-gray-500 font-medium ml-1">Name</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full text-2xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none bg-transparent px-1"
                                        placeholder="Item Name"
                                    />
                                </div>
                            ) : (
                                <h2 className="text-2xl font-bold text-gray-900 break-words">{item.name}</h2>
                            )}

                            {!isEditing && (
                                <div className="flex gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                        title="Edit Item"
                                    >
                                        <Edit2 size={20} />
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className={`p-2 rounded-full transition-colors ${shareCopied ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:bg-gray-100'}`}
                                        title={shareUrl ? 'Copy share link' : 'Create share link'}
                                    >
                                        {shareCopied ? <Check size={20} /> : shareUrl ? <Link size={20} /> : <Share2 size={20} />}
                                    </button>
                                    <button
                                        onClick={() => setIsMovePickerOpen(true)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                        title="Move Item"
                                    >
                                        <Move size={20} />
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                        title="Delete Item"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {isEditing && selectedFile && getAIConfig() && (
                            <div className="mt-2 space-y-1">
                                <button
                                    type="button"
                                    onClick={handleAIRecognize}
                                    disabled={isRecognizing}
                                    className="w-full flex items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 active:scale-95 disabled:opacity-50 transition-all"
                                >
                                    {isRecognizing ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            AI 辨識中...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={16} />
                                            AI 辨識物件
                                        </>
                                    )}
                                </button>
                                {aiError && (
                                    <p className="text-xs text-red-500 text-center">{aiError}</p>
                                )}
                            </div>
                        )}

                        {isEditing ? (
                            <div className="mt-2">
                                <label className="text-xs text-gray-500 font-medium ml-1">Note</label>
                                <textarea
                                    value={editNote}
                                    onChange={(e) => setEditNote(e.target.value)}
                                    className="w-full mt-1 p-3 rounded-lg border border-gray-200 text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                    rows={3}
                                    placeholder="Add notes..."
                                />
                            </div>
                        ) : (
                            item.note && (
                                <p className="mt-2 text-gray-600 whitespace-pre-wrap">{item.note}</p>
                            )
                        )}

                        {!isEditing && (
                            <div className="mt-6 space-y-4">
                                {/* Location Context */}
                                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-blue-700">
                                        <MapPin size={16} />
                                        Location:
                                    </div>

                                    <div className="flex flex-wrap items-center gap-1 text-sm text-gray-600">
                                        {/* Root Link */}
                                        <button
                                            onClick={() => handleNavigateToFolder(null)}
                                            className="flex items-center text-blue-600 font-medium px-2 py-1 rounded hover:bg-blue-50 hover:underline active:bg-blue-100 transition-colors"
                                        >
                                            <Home size={14} className="mr-1" />
                                            Root
                                        </button>

                                        {/* Path Segments */}
                                        {path.map((pathItem) => (
                                            <React.Fragment key={pathItem.id}>
                                                <ChevronRight size={14} className="text-gray-400" />
                                                <button
                                                    onClick={() => handleNavigateToFolder(pathItem.id)}
                                                    className="text-blue-600 font-medium px-2 py-1 rounded truncate max-w-[100px] hover:bg-blue-50 hover:underline active:bg-blue-100 transition-colors"
                                                >
                                                    {pathItem.name}
                                                </button>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Edit Actions */}
                        {isEditing && (
                            <div className="mt-8 flex gap-3">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-sm active:scale-95 transition-all"
                                >
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <FolderPicker
                isOpen={isMovePickerOpen}
                onClose={() => setIsMovePickerOpen(false)}
                itemToMove={item}
                onMove={handleMove}
            />
        </>
    );
};
