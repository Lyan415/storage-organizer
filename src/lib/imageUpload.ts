import imageCompression from 'browser-image-compression';
import { supabase } from './supabase';
import { useStore } from '../store/useStore';

const COMPRESSION_OPTIONS = {
    maxSizeMB: 0.2,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
};

async function compressImage(file: File): Promise<File> {
    if (file.size <= COMPRESSION_OPTIONS.maxSizeMB * 1024 * 1024) {
        return file;
    }
    return imageCompression(file, COMPRESSION_OPTIONS);
}

export async function uploadImage(file: File): Promise<string> {
    const user = useStore.getState().user;
    if (!user) throw new Error('User not authenticated');

    const compressed = await compressImage(file);

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from('item-images')
        .upload(fileName, compressed);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
        .from('item-images')
        .getPublicUrl(fileName);

    return data.publicUrl;
}
