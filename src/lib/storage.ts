import { supabase } from './supabase';

/**
 * Upload a file to Supabase Storage
 * @param file - The file to upload
 * @param village - Village name
 * @param month - Month number (1-12)
 * @param year - Year
 * @returns The public URL of the uploaded file
 */
export async function uploadWagelistFile(
  file: File,
  village: string,
  month: number,
  year: number
): Promise<string | null> {
  try {
    // Create a unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${village}_${year}_${month}_${Date.now()}.${fileExt}`;
    const filePath = `wagelists/${village}/${year}/${month}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('wagelists')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return null;
    }

    // Get public URL
    const { data } = supabase.storage
      .from('wagelists')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error in uploadWagelistFile:', error);
    return null;
  }
}

/**
 * Delete a file from Supabase Storage
 * @param fileUrl - The public URL of the file to delete
 */
export async function deleteWagelistFile(fileUrl: string): Promise<boolean> {
  try {
    // Extract file path from URL
    const urlParts = fileUrl.split('/storage/v1/object/public/wagelists/');
    if (urlParts.length < 2) {
      console.error('Invalid file URL format');
      return false;
    }

    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from('wagelists')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteWagelistFile:', error);
    return false;
  }
}
