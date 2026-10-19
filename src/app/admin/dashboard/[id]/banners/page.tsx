// app/admin/banners/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Eye, 
  EyeOff, 
  Image as ImageIcon,
  X
} from 'lucide-react';
import { getBanners, deleteBanner, toggleBannerStatus } from '@/app/actions/banner';
import BannerForm from '@/components/components/Admin/BannerForm';

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image: string;
  buttonText: string;
  buttonLink: string;
  type: 'PRIMARY' | 'SECONDARY';
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminBannersPage() {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const result = await getBanners();
      if (result.success) {
        const normalizedBanners = (result.data || []).map((banner: any) => ({
          ...banner,
          image: typeof banner.image === 'string' ? banner.image : '',
          createdAt:
            banner.createdAt instanceof Date
              ? banner.createdAt.toISOString()
              : String(banner.createdAt),
          updatedAt:
            banner.updatedAt instanceof Date
              ? banner.updatedAt.toISOString()
              : String(banner.updatedAt),
        }));
        setBanners(normalizedBanners);
      } else {
        toast.error(result.error || 'Failed to fetch banners');
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const result = await deleteBanner(id);
      if (result.success) {
        toast.success('Banner deleted successfully');
        fetchBanners();
      } else {
        toast.error(result.error || 'Failed to delete banner');
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Failed to delete banner');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const result = await toggleBannerStatus(id);
      if (result.success) {
        toast.success('Banner status updated');
        fetchBanners();
      } else {
        toast.error(result.error || 'Failed to update banner status');
      }
    } catch (error) {
      console.error('Error toggling banner status:', error);
      toast.error('Failed to update banner status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#DBA39A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-[#3d2c28]/60">Loading banners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3d2c28]">Banner Management</h1>
          <p className="text-[#3d2c28]/60">Manage your homepage banners</p>
        </div>
        <button
          onClick={() => {
            setEditingBanner(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-[#DBA39A] hover:bg-[#c49087] text-white font-medium rounded-xl transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Banner
        </button>
      </div>

      {/* Banner List */}
      <div className="bg-white rounded-2xl border border-[#F5EBEO] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#F5EBEO]">
          <div className="flex items-center justify-between text-sm text-[#3d2c28]/60">
            <span>{banners.length} banners</span>
            <span>Primary: {banners.filter(b => b.type === 'PRIMARY').length} | Secondary: {banners.filter(b => b.type === 'SECONDARY').length}</span>
          </div>
        </div>
        <div className="p-4">
          {banners.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🖼️</div>
              <p className="text-[#3d2c28]/60">No banners found</p>
              <button
                onClick={() => {
                  setEditingBanner(null);
                  setShowForm(true);
                }}
                className="mt-4 text-[#DBA39A] hover:underline font-medium"
              >
                Create your first banner
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    banner.isActive 
                      ? 'border-[#F5EBEO] hover:border-[#DBA39A]/30' 
                      : 'border-red-200 bg-red-50/30'
                  }`}
                >
                  {/* Image Preview */}
                  <div className="relative w-24 h-16 shrink-0 rounded-lg overflow-hidden bg-[#FEFCF3] border border-[#F5EBEO]">
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-[#3d2c28] truncate">{banner.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        banner.type === 'PRIMARY' 
                          ? 'bg-[#DBA39A]/10 text-[#DBA39A]' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {banner.type}
                      </span>
                      {!banner.isActive && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#3d2c28]/60 truncate">
                      {banner.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[#3d2c28]/40 mt-1">
                      <span>Order: {banner.order}</span>
                      <span className="w-1 h-1 rounded-full bg-[#3d2c28]/20" />
                      <span>Updated: {new Date(banner.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleStatus(banner.id)}
                      className="p-1.5 hover:bg-[#F5EBEO] rounded-lg transition-colors"
                      title={banner.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {banner.isActive ? (
                        <Eye className="h-4 w-4 text-green-500" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditingBanner(banner);
                        setShowForm(true);
                      }}
                      className="p-1.5 hover:bg-[#F5EBEO] rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4 text-[#DBA39A]" />
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-400 hover:text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Banner Form Modal */}
      {showForm && (
        <BannerForm
          banner={editingBanner}
          onClose={() => {
            setShowForm(false);
            setEditingBanner(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingBanner(null);
            fetchBanners();
          }}
        />
      )}
    </div>
  );
}