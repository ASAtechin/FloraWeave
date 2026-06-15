import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const designs = await db.savedDesign.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, designs });
  } catch (error: any) {
    console.error('Saved designs GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve saved designs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, productId, title, customizationData } = body;

    if (!userId || !productId || !title || !customizationData) {
      return NextResponse.json({ success: false, error: 'Missing design parameters' }, { status: 400 });
    }

    const design = await db.savedDesign.create({
      data: {
        userId,
        productId,
        title,
        customizationData
      }
    });

    return NextResponse.json({ success: true, design });
  } catch (error: any) {
    console.error('Saved designs POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save design' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Design ID is required' }, { status: 400 });
    }

    await db.savedDesign.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Saved designs DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete saved design' }, { status: 500 });
  }
}

