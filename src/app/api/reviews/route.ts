import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    const filters: any = { moderationState: 'APPROVED' };
    if (productId) {
      filters.productId = productId;
    }

    const reviews = await db.review.findMany({
      where: filters,
      include: {
        user: {
          select: {
            profile: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
                zodiacSign: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    console.error('Reviews GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve reviews' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, userId, rating, title, body: reviewBody, images, customizationSummary } = body;

    if (!productId || !userId || !rating || !reviewBody) {
      return NextResponse.json({ success: false, error: 'Missing review parameters' }, { status: 400 });
    }

    // Submit review in PENDING moderation state
    const review = await db.review.create({
      data: {
        productId,
        userId,
        rating: parseInt(rating),
        title,
        body: reviewBody,
        images: images || [],
        customizationSummary,
        moderationState: 'PENDING'
      }
    });

    // Award loyalty points for writing a review (50 points)
    const wallet = await db.loyaltyWallet.findUnique({ where: { userId } });
    if (wallet) {
      await db.loyaltyWallet.update({
        where: { id: wallet.id },
        data: { points: { increment: 50 } }
      });
      await db.loyaltyLedger.create({
        data: {
          walletId: wallet.id,
          points: 50,
          reason: 'REVIEW',
          metadata: { reviewId: review.id }
        }
      });
    }

    return NextResponse.json({ success: true, review, message: 'Review submitted. Awaiting moderation.' });
  } catch (error: any) {
    console.error('Reviews POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to post review' }, { status: 500 });
  }
}
