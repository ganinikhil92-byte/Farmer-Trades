import React, { useState, useRef } from 'react';
import api from '../utils/api';
import { Camera, Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import { resolveProduceImage, handleImageError } from '../utils/producePhoto';

interface ListingItem {
  id: number | string;
  crop_name: string;
  image_url?: string;
  farmer_id: string;
  category?: string;
}

interface ListingPhotoModalProps {
  listing: ListingItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (listingId: number | string, newImageUrl: string) => void;
}

export default function ListingPhotoModal({ listing, isOpen, onClose, onSuccess }: ListingPhotoModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  function handleFileSelected(file: File | null) {
    setErrorMsg(null);
    if (!file) return;

    // 1. File size check (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 5 MB limit.`);
      return;
    }

    // 2. Format check (JPG, PNG, WEBP)
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const lower = file.name.toLowerCase();
    const hasValidExt = validExtensions.some((ext) => lower.endsWith(ext));
    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    const hasValidMime = validMimes.includes(file.type);

    if (!hasValidExt && !hasValidMime) {
      setErrorMsg('Unsupported format. Please select a genuine JPG, PNG, or WEBP image.');
      return;
    }

    // 3. Client-side actual image decoding validation
    const objectUrl = URL.createObjectURL(file);
    const testImg = new Image();
    testImg.onload = () => {
      URL.revokeObjectURL(objectUrl);
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
      reader.readAsDataURL(file);
    };
    testImg.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setErrorMsg('Invalid image content. File could not be decoded as a valid photo.');
      setSelectedFile(null);
      setPreviewUrl(null);
    };
    testImg.src = objectUrl;
  }

  async function handleSave() {
    if (!selectedFile) {
      setErrorMsg('Please choose or take a photo before saving.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await api.post(`/listings/${listing.id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success && res.data?.image_url) {
        setSuccessMsg('Photo updated successfully!');
        onSuccess(listing.id, res.data.image_url);
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        throw new Error(res.data?.message || 'Failed to update photo');
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message || 'Photo upload failed. Please try again.';
      setErrorMsg(detail);
    } finally {
      setLoading(false);
    }
  }

  const currentImg = resolveProduceImage({
    name: listing.crop_name,
    category: listing.category,
    imageUrl: listing.image_url,
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 480,
          background: '#ffffff',
          borderRadius: '1rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          padding: '1.5rem',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
              Update Produce Photo
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              {listing.crop_name} (Listing #{listing.id})
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '0.35rem',
              borderRadius: '0.375rem',
              display: 'flex',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Status alerts */}
        {errorMsg && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              color: '#b91c1c',
              marginBottom: '1rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              color: '#15803d',
              marginBottom: '1rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <CheckCircle size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Photo Display / Preview */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div
            style={{
              borderRadius: '0.75rem',
              overflow: 'hidden',
              border: '1.5px solid #e2e8f0',
              background: '#f8fafc',
              position: 'relative',
              textAlign: 'center',
              minHeight: 180,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={previewUrl || currentImg.url}
              alt={listing.crop_name}
              style={{ width: '100%', maxHeight: 220, objectFit: 'cover', display: 'block' }}
              onError={handleImageError}
            />
            <span
              style={{
                position: 'absolute',
                top: '0.5rem',
                left: '0.5rem',
                background: previewUrl || currentImg.isSellerProvided ? 'rgba(22, 101, 52, 0.9)' : 'rgba(100, 116, 139, 0.9)',
                color: '#fff',
                padding: '0.2rem 0.55rem',
                borderRadius: '0.35rem',
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.3px',
              }}
            >
              {previewUrl ? 'New photo preview' : currentImg.label}
            </span>
          </div>
        </div>

        {/* Action Buttons: Upload or Take Photo */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
          >
            <Upload size={15} /> Upload Photo
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => cameraInputRef.current?.click()}
            disabled={loading}
            style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
          >
            <Camera size={15} /> Take Photo
          </button>
        </div>

        {/* Hidden inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          style={{ display: 'none' }}
          onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
        />

        {/* Footer actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={loading || !selectedFile}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {loading ? 'Saving...' : 'Save Photo'}
          </button>
        </div>
      </div>
    </div>
  );
}
