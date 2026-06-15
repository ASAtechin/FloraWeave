import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const zodiac = searchParams.get('zodiac');
    const flower = searchParams.get('flower');
    const maxPrice = searchParams.get('maxPrice');
    const isFeatured = searchParams.get('featured');

    const filters: any = { isActive: true };

    if (category) {
      filters.category = { slug: category };
    }

    if (isFeatured) {
      filters.isFeatured = true;
    }

    if (maxPrice) {
      filters.price = { lte: parseFloat(maxPrice) };
    }

    if (zodiac) {
      filters.zodiacMappings = {
        some: { zodiacSign: zodiac },
      };
    }

    if (flower) {
      filters.birthFlowerMappings = {
        some: { birthFlower: flower },
      };
    }

    const products = await db.product.findMany({
      where: filters,
      include: {
        category: true,
        zodiacMappings: true,
        birthFlowerMappings: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve products' },
      { status: 500 }
    );
  }
}
