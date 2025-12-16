import { supabase } from '../supabase.client';
import { getCurrentMember } from '../auth/auth.service';

// Upload member file (profile image or CV)
export async function uploadMemberFile(
  file: File, 
  type: 'profile' | 'cv', 
  memberId?: string
): Promise<string> {
  if (!memberId) {
    const member = await getCurrentMember();
    if (!member) throw new Error('No authenticated member');
    memberId = member.id;
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${memberId}-${type}-${Date.now()}.${fileExt}`;
  const filePath = `member-assets/${type}s/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('member-files')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('member-files')
    .getPublicUrl(filePath);

  return publicUrl;
}

// Delete member file
export async function deleteMemberFile(filePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from('member-files')
    .remove([filePath]);

  if (error) throw error;
}

// Get file download URL
export async function getFileDownloadUrl(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('member-files')
    .createSignedUrl(filePath, 3600); // 1 hour expiry

  if (error) throw error;
  return data.signedUrl;
}

