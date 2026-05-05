import React, { useState } from 'react';
import { X, Upload, Camera } from 'lucide-react';
import { useStore } from '../store/useStore';
import { uploadImage } from '../lib/imageUpload';

interface AddItemModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose }) => {
    const { currentFolderId, addItem } = useStore();
    const [name, setName] = useState('');
    const [note, setNote] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSubmitting(true);

        const finalName = name.trim() || `Item ${new Date().toLocaleString('zh-TW', { hour12: false })}`;

        try {
            let imageUrl = '';

            // If there is a file selected (we need to track the file, not just the preview URL)
            // Need to update state to store the File object
            const fileInput = document.getElementById('add-item-file-input') as HTMLInputElement;
            if (fileInput?.files?.[0]) {
                imageUrl = await uploadImage(fileInput.files[0]);
            } else if (previewUrl) {
                // If previewUrl exists but no file (shouldn't happen in add mode unless we preset stuff), keep it or use placeholder
                imageUrl = previewUrl;
            } else {
                imageUrl = `https://images.unsplash.com/photo-${['1618331835717-801e976710b2', '1586105251261-72a756497a11', '1589829085413-56de8ae18c73'][Math.floor(Math.random() * 3)]
                    }?auto=format&fit=crop&q=80&w=800`;
            }

            await addItem({
                name: finalName,
                note: note,
                parentId: currentFolderId,
                imageUrl: imageUrl,
                projectId: '',
            });

        } catch (error) {
            console.error(error);
            alert('Error adding item. Please try again.');
        } finally {
            setIsSubmitting(false);
            setName('');
            setNote('');
            setPreviewUrl(null);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white sm:rounded-2xl rounded-t-2xl shadow-xl animate-in slide-in-from-bottom duration-300">

                {/* Header */}
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <h2 className="text-lg font-semibold">Add New Item</h2>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">

                    {/* Real Upload Area */}
                    <label className="relative flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-dashed border-2 border-gray-300 bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors overflow-hidden">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center">
                                <Camera size={32} />
                                <span className="text-xs mt-2">Tap to take photo</span>
                            </div>
                        )}
                        <input
                            id="add-item-file-input"
                            type="file"
                            accept="image/*"
                            capture="environment" // Favors rear camera on mobile
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </label>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Red Box (Leave empty for auto-name)"
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        // autoFocus removed for better mobile UX (keyboard pop)
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Note (Optional)</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Any details..."
                            rows={2}
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-md active:scale-95 disabled:bg-gray-300 disabled:shadow-none"
                    >
                        {isSubmitting ? 'Uploading...' : (
                            <>
                                <Upload size={18} />
                                Save Item
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
