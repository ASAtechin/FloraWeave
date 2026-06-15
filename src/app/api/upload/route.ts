import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'images', 'products');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

async function uploadToCatbox(buffer: Buffer, filename: string): Promise<string> {
  const blob = new Blob([new Uint8Array(buffer)], { type: 'image/webp' });
  const formData = new FormData();
  formData.append('reqtype', 'fileupload');
  formData.append('fileToUpload', blob, filename);

  const response = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Catbox upload failed: ${response.statusText}`);
  }

  const url = await response.text();
  if (!url.startsWith('http')) {
    throw new Error(`Invalid Catbox response: ${url}`);
  }

  return url.trim();
}

async function uploadToImgBB(buffer: Buffer, filename: string, apiKey: string): Promise<string> {
  const blob = new Blob([new Uint8Array(buffer)], { type: 'image/webp' });
  const formData = new FormData();
  formData.append('image', blob, filename);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`ImgBB upload failed: ${response.statusText}`);
  }

  const data = await response.json();
  if (data?.data?.url) {
    return data.data.url;
  }
  throw new Error('Invalid ImgBB response structure');
}

export async function POST(request: NextRequest) {
  // Auth check
  const token = request.headers.get('x-admin-token');
  if (token !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const results: { original: string; optimized: string; thumbnail: string; url: string; thumbnailUrl: string; size: number }[] = [];

    for (const file of files) {
      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Allowed: ${ALLOWED_TYPES.join(', ')}` },
          { status: 400 }
        );
      }

      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max: 10MB` },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const timestamp = Date.now();
      const baseName = sanitizeFilename(path.parse(file.name).name);
      const optimizedName = `${baseName}-${timestamp}.webp`;
      const thumbnailName = `${baseName}-${timestamp}-thumb.webp`;

      // Process: Create optimized version (max 1200px wide, WebP, quality 82)
      const optimizedBuffer = await sharp(buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();

      // Process: Create thumbnail (400px wide, lower quality)
      const thumbnailBuffer = await sharp(buffer)
        .resize(400, 400, { fit: 'cover' })
        .webp({ quality: 70 })
        .toBuffer();

      let url = '';
      let thumbnailUrl = '';
      let storageType = '';

      // 1. Try ImgBB if key is set
      if (process.env.IMGBB_API_KEY) {
        try {
          url = await uploadToImgBB(optimizedBuffer, optimizedName, process.env.IMGBB_API_KEY);
          thumbnailUrl = await uploadToImgBB(thumbnailBuffer, thumbnailName, process.env.IMGBB_API_KEY);
          storageType = 'imgbb';
        } catch (e) {
          console.error('ImgBB upload failed, falling back...', e);
        }
      }

      // 2. Try Catbox as primary keyless remote server
      if (!url) {
        try {
          url = await uploadToCatbox(optimizedBuffer, optimizedName);
          thumbnailUrl = await uploadToCatbox(thumbnailBuffer, thumbnailName);
          storageType = 'catbox';
        } catch (e) {
          console.error('Catbox upload failed, falling back...', e);
        }
      }

      // 3. Fallback to Local Storage if all remote servers are down/unavailable
      if (!url) {
        if (!existsSync(UPLOAD_DIR)) {
          await mkdir(UPLOAD_DIR, { recursive: true });
        }
        const optimizedPath = path.join(UPLOAD_DIR, optimizedName);
        const thumbnailPath = path.join(UPLOAD_DIR, thumbnailName);

        await writeFile(optimizedPath, optimizedBuffer);
        await writeFile(thumbnailPath, thumbnailBuffer);

        url = `/images/products/${optimizedName}`;
        thumbnailUrl = `/images/products/${thumbnailName}`;
        storageType = 'local';
      }

      results.push({
        original: file.name,
        optimized: storageType === 'local' ? optimizedName : url,
        thumbnail: storageType === 'local' ? thumbnailName : thumbnailUrl,
        url,
        thumbnailUrl,
        size: optimizedBuffer.length,
      });
    }

    return NextResponse.json({
      success: true,
      uploaded: results.length,
      files: results,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed: ' + (error?.message || 'Unknown error') },
      { status: 500 }
    );
  }
}

// GET: List all uploaded product images (lists local ones)
export async function GET(request: NextRequest) {
  const token = request.headers.get('x-admin-token');
  if (token !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { readdir, stat } = await import('fs/promises');
    
    if (!existsSync(UPLOAD_DIR)) {
      return NextResponse.json({ files: [] });
    }

    const entries = await readdir(UPLOAD_DIR);
    const images = await Promise.all(
      entries
        .filter(f => /\.(webp|jpg|jpeg|png|avif)$/i.test(f))
        .map(async (name) => {
          const fileStat = await stat(path.join(UPLOAD_DIR, name));
          return {
            name,
            url: `/images/products/${name}`,
            size: fileStat.size,
            modified: fileStat.mtime,
            isThumbnail: name.includes('-thumb'),
          };
        })
    );

    const mainImages = images.filter(img => !img.isThumbnail);
    
    return NextResponse.json({ files: mainImages, total: mainImages.length });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to list images' }, { status: 500 });
  }
}

// DELETE: Remove an uploaded image
export async function DELETE(request: NextRequest) {
  const token = request.headers.get('x-admin-token');
  if (token !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { filename } = await request.json();
    if (!filename || typeof filename !== 'string') {
      return NextResponse.json({ error: 'Filename required' }, { status: 400 });
    }

    // If it's a remote URL, we don't delete from remote server (since it's anonymous), just return success
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return NextResponse.json({ success: true, message: 'Remote image reference removed' });
    }

    // Security: prevent directory traversal
    const safeName = path.basename(filename);
    if (safeName !== filename || filename.includes('..')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    const { unlink } = await import('fs/promises');
    const filePath = path.join(UPLOAD_DIR, safeName);
    
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    await unlink(filePath);

    // Also delete thumbnail if exists
    const thumbName = safeName.replace('.webp', '-thumb.webp').replace(/-(\d+)\./, '-$1-thumb.');
    const thumbPath = path.join(UPLOAD_DIR, thumbName);
    if (existsSync(thumbPath)) {
      await unlink(thumbPath);
    }

    return NextResponse.json({ success: true, deleted: safeName });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Delete failed' }, { status: 500 });
  }
}
