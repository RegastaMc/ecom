// app/actions/banner.ts
'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';


const bannerSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  subtitle: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  image: z.string().url('Please enter a valid image URL'),
  buttonText: z.string().default('Shop Now'),
  buttonLink: z.string().default('#'),
  type: z.enum(['PRIMARY', 'SECONDARY']),
  isActive: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
});

export type BannerInput = z.infer<typeof bannerSchema>;


export async function createBanner(formData: FormData) {
  try {
    const rawData = {
      title: formData.get('title'),
      subtitle: formData.get('subtitle') || null,
      description: formData.get('description') || null,
      image: formData.get('image'),
      buttonText: formData.get('buttonText') || 'Shop Now',
      buttonLink: formData.get('buttonLink') || '#',
      type: formData.get('type') || 'PRIMARY',
      isActive: formData.get('isActive') === 'on' || formData.get('isActive') === 'true',
      order: Number(formData.get('order')) || 0,
    };

    const validatedData = bannerSchema.safeParse(rawData);

    if (!validatedData.success) {
      return {
        success: false,
        errors: validatedData.error.flatten().fieldErrors,
      };
    }

    const banner = await db.banner.create({
      data: validatedData.data,
    });

    revalidatePath('/');
    revalidatePath('/admin/dashboard/[...id]/banners');

    return {
      success: true,
      data: banner,
    };
  } catch (error) {
    console.error('Create banner error:', error);
    return {
      success: false,
      error: 'Failed to create banner',
    };
  }
}


export async function getBanners(type?: 'PRIMARY' | 'SECONDARY') {
  try {
    const where: any = {};
    if (type) {
      where.type = type;
    }

    const banners = await db.banner.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return {
      success: true,
      data: banners,
    };
  } catch (error) {
    console.error('Get banners error:', error);
    return {
      success: false,
      error: 'Failed to fetch banners',
      data: [],
    };
  }
}


export async function getBannerById(id: string) {
  try {
    const banner = await db.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      return {
        success: false,
        error: 'Banner not found',
        data: null,
      };
    }

    return {
      success: true,
      data: banner,
    };
  } catch (error) {
    console.error('Get banner error:', error);
    return {
      success: false,
      error: 'Failed to fetch banner',
      data: null,
    };
  }
}


export async function updateBanner(id: string, formData: FormData) {
  try {
    const rawData = {
      title: formData.get('title'),
      subtitle: formData.get('subtitle') || null,
      description: formData.get('description') || null,
      image: formData.get('image'),
      buttonText: formData.get('buttonText') || 'Shop Now',
      buttonLink: formData.get('buttonLink') || '#',
      type: formData.get('type') || 'PRIMARY',
      isActive: formData.get('isActive') === 'on' || formData.get('isActive') === 'true',
      order: Number(formData.get('order')) || 0,
    };

    const validatedData = bannerSchema.safeParse(rawData);

    if (!validatedData.success) {
      return {
        success: false,
        errors: validatedData.error.flatten().fieldErrors,
      };
    }

    const banner = await db.banner.update({
      where: { id },
      data: validatedData.data,
    });

    revalidatePath('/');
    revalidatePath('/admin/dashboard/[...id]/banners');

    return {
      success: true,
      data: banner,
    };
  } catch (error) {
    console.error('Update banner error:', error);
    return {
      success: false,
      error: 'Failed to update banner',
    };
  }
}

export async function deleteBanner(id: string) {
  try {
    await db.banner.delete({
      where: { id },
    });

    revalidatePath('/');
    revalidatePath('/admin/dashboard/[...id]/banners');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Delete banner error:', error);
    return {
      success: false,
      error: 'Failed to delete banner',
    };
  }
}


export async function toggleBannerStatus(id: string) {
  try {
    const banner = await db.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      return {
        success: false,
        error: 'Banner not found',
      };
    }

    await db.banner.update({
      where: { id },
      data: { isActive: !banner.isActive },
    });

    revalidatePath('/');
    revalidatePath('/admin/dashboard/[...id]/banners');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Toggle banner status error:', error);
    return {
      success: false,
      error: 'Failed to toggle banner status',
    };
  }
}