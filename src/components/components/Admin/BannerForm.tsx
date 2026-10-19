// components/BannerForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { createBanner, updateBanner } from '@/app/actions/banner';

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

interface BannerFormProps {
  banner?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BannerForm({ banner, onClose, onSuccess }: BannerFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image: '',
    buttonText: 'Shop Now',
    buttonLink: '#',
    type: 'PRIMARY',
    isActive: true,
    order: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        description: banner.description || '',
        image: banner.image || '',
        buttonText: banner.buttonText || 'Shop Now',
        buttonLink: banner.buttonLink || '#',
        type: banner.type || 'PRIMARY',
        isActive: banner.isActive !== undefined ? banner.isActive : true,
        order: banner.order || 0,
      });
    }
  }, [banner]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // ============================================================
  // IMAGE UPLOAD FUNCTIONS
  // ============================================================
  const getPublicIdFromUrl = (url: string) => {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;

    const pathParts = parts[1].split('/');
    const versionIndex = pathParts.findIndex((part) => part.startsWith('v'));
    const startIndex = versionIndex !== -1 ? versionIndex + 1 : 0;

    const publicIdWithExtension = pathParts.slice(startIndex).join('/');
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');
    return publicId;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Only allow one image
    if (files.length > 1) {
      toast.error('Please select only one image');
      return;
    }

    setUploading(true);

    try {
      const file = files[0];
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.url) {
        setFormData(prev => ({ ...prev, image: data.url }));
        toast.success('Image uploaded successfully');
        if (errors.image) {
          setErrors(prev => ({ ...prev, image: '' }));
        }
      } else {
        toast.error('Failed to upload image. Please try again.');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      // Reset input value to allow re-uploading the same file
      const input = document.getElementById('image-upload') as HTMLInputElement;
      if (input) input.value = '';
    }
  };

  const removeImage = async () => {
    const imageToRemove = formData.image;

    if (!imageToRemove) return;

    const publicId = getPublicIdFromUrl(imageToRemove);

    if (publicId) {
      try {
        const response = await fetch('/api/upload', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ publicId }),
        });

        const result = await response.json();
        if (result.data?.success || result.success) {
          setFormData(prev => ({ ...prev, image: '' }));
          toast.success('Image deleted successfully');
        } else {
          toast.error('Failed to delete image. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting image:', error);
        toast.error('Failed to delete image. Please try again.');
      }
    } else {
      // If not a Cloudinary URL, just remove locally
      setFormData(prev => ({ ...prev, image: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, String(value));
      });

      let result;
      if (banner) {
        result = await updateBanner(banner.id, submitData);
      } else {
        result = await createBanner(submitData);
      }

      if (result.success) {
        toast.success(banner ? 'Banner updated successfully!' : 'Banner created successfully!');
        onSuccess();
      } else if (result.errors) {
        const parsedErrors = Object.entries(result.errors).reduce((acc, [key, value]) => {
          acc[key] = Array.isArray(value) ? value.join(' ') : String(value);
          return acc;
        }, {} as Record<string, string>);
        setErrors(parsedErrors);
      } else {
        toast.error(result.error || 'Failed to save banner');
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error('Failed to save banner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#F5EBEO] px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#3d2c28]">
            {banner ? 'Edit Banner' : 'Create Banner'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#F5EBEO] rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-[#3d2c28]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[#3d2c28] mb-1.5">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Banner title"
              className={`w-full px-4 py-2.5 rounded-xl border ${
                errors.title ? 'border-red-300 focus:ring-red-200' : 'border-[#F5EBEO] focus:ring-[#DBA39A]/20'
              } focus:outline-none focus:ring-2 focus:border-[#DBA39A] transition-colors`}
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-medium text-[#3d2c28] mb-1.5">
              Subtitle
            </label>
            <input
              type="text"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              placeholder="Banner subtitle"
              className="w-full px-4 py-2.5 rounded-xl border border-[#F5EBEO] focus:outline-none focus:ring-2 focus:ring-[#DBA39A]/20 focus:border-[#DBA39A] transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#3d2c28] mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              placeholder="Banner description"
              className="w-full px-4 py-2.5 rounded-xl border border-[#F5EBEO] focus:outline-none focus:ring-2 focus:ring-[#DBA39A]/20 focus:border-[#DBA39A] transition-colors resize-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-[#3d2c28] mb-1.5">
              Image *
            </label>
            
            {/* Upload Area */}
            <div className="relative">
              {!formData.image ? (
                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                  uploading ? 'border-[#DBA39A] bg-[#F5EBEO]/30' : 'border-[#F5EBEO] hover:border-[#DBA39A]/50'
                }`}>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2">
                    {uploading ? (
                      <>
                        <div className="w-8 h-8 border-4 border-[#DBA39A] border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-[#3d2c28]/60">Uploading...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 text-[#b8a69c]" />
                        <p className="text-sm text-[#3d2c28]/60">
                          Click or drag to upload an image
                        </p>
                        <p className="text-xs text-[#b8a69c]">
                          PNG, JPG, WEBP up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {/* Image Preview */}
                  <div className="relative w-full max-h-48 rounded-xl overflow-hidden border border-[#F5EBEO] bg-[#FEFCF3]">
                    <img
                      src={formData.image}
                      alt="Banner preview"
                      className="w-full h-full object-contain max-h-48"
                    />
                    
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <label
                        htmlFor="image-upload"
                        className="p-2 bg-white rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <Upload className="h-5 w-5 text-[#3d2c28]" />
                      </label>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="h-5 w-5 text-white" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Hidden file input for re-upload */}
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  
                  <p className="text-xs text-[#3d2c28]/40 mt-1">
                    Hover over image to change or delete
                  </p>
                </div>
              )}
            </div>
            
            {errors.image && <p className="mt-1 text-xs text-red-500">{errors.image}</p>}
          </div>

          {/* Button Text & Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#3d2c28] mb-1.5">
                Button Text
              </label>
              <input
                type="text"
                name="buttonText"
                value={formData.buttonText}
                onChange={handleChange}
                placeholder="Shop Now"
                className="w-full px-4 py-2.5 rounded-xl border border-[#F5EBEO] focus:outline-none focus:ring-2 focus:ring-[#DBA39A]/20 focus:border-[#DBA39A] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#3d2c28] mb-1.5">
                Button Link
              </label>
              <input
                type="text"
                name="buttonLink"
                value={formData.buttonLink}
                onChange={handleChange}
                placeholder="#"
                className="w-full px-4 py-2.5 rounded-xl border border-[#F5EBEO] focus:outline-none focus:ring-2 focus:ring-[#DBA39A]/20 focus:border-[#DBA39A] transition-colors"
              />
            </div>
          </div>

          {/* Type & Order */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#3d2c28] mb-1.5">
                Banner Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-[#F5EBEO] focus:outline-none focus:ring-2 focus:ring-[#DBA39A]/20 focus:border-[#DBA39A] transition-colors"
              >
                <option value="PRIMARY">Primary (2/3 width)</option>
                <option value="SECONDARY">Secondary (1/3 width)</option>
              </select>
              {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#3d2c28] mb-1.5">
                Display Order
              </label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2.5 rounded-xl border border-[#F5EBEO] focus:outline-none focus:ring-2 focus:ring-[#DBA39A]/20 focus:border-[#DBA39A] transition-colors"
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleCheckboxChange}
              className="w-4 h-4 rounded border-[#F5EBEO] text-[#DBA39A] focus:ring-[#DBA39A] focus:ring-offset-0"
            />
            <label className="text-sm text-[#3d2c28]">
              Active (banner will be displayed on the homepage)
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-[#F5EBEO]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-[#F5EBEO] hover:border-[#DBA39A]/40 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 px-6 py-3 bg-[#DBA39A] hover:bg-[#c49087] text-white font-medium rounded-xl transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading || uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{uploading ? 'Uploading...' : banner ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <span>{banner ? 'Update Banner' : 'Create Banner'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}