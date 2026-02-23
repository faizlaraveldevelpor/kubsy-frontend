import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

export const uploadImageToSupabase = async (uri:string) => {
  console.log(uri);
  
  try {
    if (!uri) throw new Error('URI missing');

    const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    // 1️⃣ Read file as base64
   const base64 = await FileSystem.readAsStringAsync(uri, {
  encoding: 'base64' as any,
});

    // 2️⃣ Convert base64 → ArrayBuffer
    const arrayBuffer = decode(base64);

    // 3️⃣ Upload
    const { error } = await supabase.storage
      .from('user')
      .upload(filePath, arrayBuffer, {
        contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
        upsert: true,
      });

    if (error) throw error;

    // 4️⃣ Public URL
    const { data } = supabase.storage
      .from('user')
      .getPublicUrl(filePath);
    return data.publicUrl;

  } catch (err) {
    console.log('Upload Error:', err);
    return null;
  }
};