// Member File Upload Handler
// Handles profile images and resume uploads with optimization

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface UploadRequest {
  memberId: string;
  fileType: 'profile_image' | 'resume';
  file: File;
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const formData = await request.formData();
    const memberId = formData.get('memberId') as string;
    const fileType = formData.get('fileType') as 'profile_image' | 'resume';
    const file = formData.get('file') as File;

    if (!memberId || !fileType || !file) {
      return new Response('Missing required fields', { status: 400 });
    }

    // Validate file type
    if (!['profile_image', 'resume'].includes(fileType)) {
      return new Response('Invalid file type', { status: 400 });
    }

    // Validate file size and type
    const validation = validateFile(file, fileType);
    if (!validation.valid) {
      return new Response(validation.error, { status: 400 });
    }

    let fileToUpload = file;
    let fileName = file.name;

    // Optimize profile images
    if (fileType === 'profile_image') {
      const optimizedFile = await optimizeProfileImage(file);
      if (optimizedFile) {
        fileToUpload = optimizedFile;
        fileName = `optimized_${file.name}`;
      }
    }

    // Generate storage path
    const fileExtension = fileName.split('.').pop();
    const timestamp = Date.now();
    const storagePath = `${fileType}s/${memberId}/${timestamp}.${fileExtension}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('member-files')
      .upload(storagePath, fileToUpload, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response('Upload failed', { status: 500 });
    }

    // Register file in database
    const { data: fileId, error: dbError } = await supabase
      .rpc('register_member_file', {
        member_id_param: memberId,
        file_type_param: fileType,
        original_filename_param: file.name,
        storage_path_param: storagePath,
        file_size_param: fileToUpload.size,
        mime_type_param: fileToUpload.type
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // Clean up uploaded file
      await supabase.storage.from('member-files').remove([storagePath]);
      return new Response('Database registration failed', { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('member-files')
      .getPublicUrl(storagePath);

    return new Response(JSON.stringify({
      success: true,
      fileId,
      url: urlData.publicUrl,
      path: storagePath,
      optimized: fileType === 'profile_image' && fileToUpload !== file
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('File upload error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

function validateFile(file: File, fileType: string): { valid: boolean; error?: string } {
  const maxSizes = {
    profile_image: 5 * 1024 * 1024, // 5MB
    resume: 10 * 1024 * 1024 // 10MB
  };

  const allowedTypes = {
    profile_image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    resume: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  };

  // Check file size
  if (file.size > maxSizes[fileType as keyof typeof maxSizes]) {
    const maxSizeMB = maxSizes[fileType as keyof typeof maxSizes] / (1024 * 1024);
    return {
      valid: false,
      error: `File too large. Maximum size for ${fileType} is ${maxSizeMB}MB`
    };
  }

  // Check file type
  const allowed = allowedTypes[fileType as keyof typeof allowedTypes];
  if (!allowed.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types for ${fileType}: ${allowed.join(', ')}`
    };
  }

  return { valid: true };
}

async function optimizeProfileImage(file: File): Promise<File | null> {
  try {
    // Create canvas for image optimization
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;

    // Create image
    const img = new Image();
    const imageUrl = URL.createObjectURL(file);
    
    return new Promise((resolve) => {
      img.onload = () => {
        // Calculate optimal dimensions (max 800x800, maintain aspect ratio)
        const maxSize = 800;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(imageUrl);
            if (blob) {
              const optimizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(optimizedFile);
            } else {
              resolve(null);
            }
          },
          'image/jpeg',
          0.85 // 85% quality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        resolve(null);
      };

      img.src = imageUrl;
    });

  } catch (error) {
    console.error('Image optimization error:', error);
    return null;
  }
}