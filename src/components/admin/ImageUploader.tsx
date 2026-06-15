'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Check, AlertCircle, Trash2, Copy } from 'lucide-react';

interface UploadedFile {
  original: string;
  optimized: string;
  thumbnail: string;
  url: string;
  thumbnailUrl: string;
  size: number;
}

interface ImageUploaderProps {
  token: string;
  onUploadComplete?: (files: UploadedFile[]) => void;
  maxFiles?: number;
  className?: string;
}

export default function ImageUploader({ token, onUploadComplete, maxFiles = 10, className = '' }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<{ file: File; preview: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) addPreviews(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) addPreviews(files);
  };

  const addPreviews = (files: File[]) => {
    setError(null);
    const limited = files.slice(0, maxFiles);
    const newPreviews = limited.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPreviews(prev => [...prev, ...newPreviews].slice(0, maxFiles));
  };

  const removePreview = (index: number) => {
    setPreviews(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const uploadFiles = async () => {
    if (previews.length === 0) return;
    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      previews.forEach(p => formData.append('files', p.file));

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'x-admin-token': token },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Upload failed');
      }

      const data = await response.json();
      setUploadedFiles(prev => [...prev, ...data.files]);
      setUploadProgress(100);
      
      // Cleanup previews
      previews.forEach(p => URL.revokeObjectURL(p.preview));
      setPreviews([]);
      
      onUploadComplete?.(data.files);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  const deleteFile = async (filename: string) => {
    try {
      const res = await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'x-admin-token': token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      });
      if (res.ok) {
        setUploadedFiles(prev => prev.filter(f => f.optimized !== filename));
      }
    } catch {}
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
          ${isDragging 
            ? 'border-cyan-400 bg-cyan-500/5 scale-[1.01]' 
            : 'border-white/10 hover:border-white/20 bg-space-900/40'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="space-y-3">
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-cyan-500/20' : 'bg-white/5'}`}>
            <Upload className={`h-5 w-5 ${isDragging ? 'text-cyan-400' : 'text-white/40'}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-white/80">
              {isDragging ? 'Drop images here' : 'Drag & drop product images'}
            </p>
            <p className="text-xs text-white/40 mt-1">
              JPEG, PNG, WebP, AVIF · Max 10MB each · Auto-optimized to WebP
            </p>
          </div>
        </div>
      </div>

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-white/50">{previews.length} file{previews.length > 1 ? 's' : ''} ready</span>
            <button
              onClick={uploadFiles}
              disabled={uploading}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  Upload All
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {previews.map((p, i) => (
              <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10">
                <img src={p.preview} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={(e) => { e.stopPropagation(); removePreview(i); }}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white/70 px-2 py-1 truncate">
                  {p.file.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <span className="text-sm text-red-300">{error}</span>
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-mono text-white/50 uppercase tracking-wider">Uploaded</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {uploadedFiles.map((file, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 bg-green-500/5 border border-green-500/20 rounded-lg">
                <img src={file.thumbnailUrl} alt="" className="w-10 h-10 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/80 truncate">{file.original}</p>
                  <p className="text-[10px] text-white/40">{(file.size / 1024).toFixed(0)}KB · WebP</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => copyUrl(file.url)}
                    className="p-1.5 rounded hover:bg-white/5 text-white/40 hover:text-cyan-400 transition-colors"
                    title="Copy URL"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => deleteFile(file.optimized)}
                    className="p-1.5 rounded hover:bg-white/5 text-white/40 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <Check className="h-4 w-4 text-green-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
