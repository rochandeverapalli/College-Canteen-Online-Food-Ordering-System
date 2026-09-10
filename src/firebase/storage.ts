import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

export async function uploadFoodImage(file: File): Promise<string> {
  // Validate file type & size (max 5MB)
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file (PNG, JPG, WebP).');
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image size must be less than 5MB.');
  }

  try {
    const cleanFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storageRef = ref(storage, `food-images/${cleanFileName}`);
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
    });
    return await getDownloadURL(snapshot.ref);
  } catch (err: unknown) {
    console.warn('Direct Firebase Storage upload fallback to Data URL for local/demo handling:', err);
    // Safe graceful client-side fallback if Storage is not enabled on the project yet
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }
}
