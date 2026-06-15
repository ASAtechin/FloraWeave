import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { OrderStatus, ModerationState } from '@prisma/client';

// ─── Authentication Guard ──────────────────────────────
function verifyAdmin(request: Request): boolean {
  const token = request.headers.get('x-admin-token');
  const secret = process.env.ADMIN_SECRET;
  if (!secret || !token) return false;
  return token === secret;
}

export async function GET(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Invalid admin credentials.' },
      { status: 401 }
    );
  }

  try {
    // Fetch all business management datasets
    const [orders, reviews, products, categories, artisans, loyaltyWallets, experiments] = await Promise.all([
      db.order.findMany({
        include: {
          items: {
            include: {
              product: true,
              artisan: true,
            },
          },
          user: {
            include: {
              profile: true,
            },
          },
          fulfillmentOrders: {
            include: {
              artisan: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.review.findMany({
        include: {
          product: true,
          user: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.product.findMany({
        include: {
          category: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.category.findMany(),
      db.artisanProfile.findMany({
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
      }),
      db.loyaltyWallet.findMany({
        include: {
          user: {
            include: {
              profile: true,
            },
          },
          ledgers: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      }),
      db.experiment.findMany({
        include: {
          assignments: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      orders,
      reviews,
      products,
      categories,
      artisans,
      loyaltyWallets,
      experiments,
    });
  } catch (error: any) {
    console.error('Error fetching admin data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch management dashboard data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Invalid admin credentials.' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json({ success: false, error: 'Action parameter is required' }, { status: 400 });
    }

    // ─── ORDER MANAGEMENT ─────────────────────────────────
    if (action === 'updateOrderStatus') {
      const { orderId, status, paymentStatus, artisanId, trackingNumber, carrier } = body;
      
      const updatedOrder = await db.$transaction(async (tx) => {
        const orderUpdateData: any = {};
        if (status) orderUpdateData.status = status as OrderStatus;
        if (paymentStatus) orderUpdateData.paymentStatus = paymentStatus;
        
        const order = await tx.order.update({
          where: { id: orderId },
          data: orderUpdateData,
        });

        if (artisanId) {
          await tx.orderItem.updateMany({
            where: { orderId },
            data: { artisanId },
          });

          const fulfillment = await tx.vendorFulfillment.findFirst({
            where: { orderId },
          });

          if (fulfillment) {
            await tx.vendorFulfillment.update({
              where: { id: fulfillment.id },
              data: { artisanId },
            });
          } else {
            await tx.vendorFulfillment.create({
              data: {
                orderId,
                artisanId,
                status: (status as any) || 'PENDING',
              },
            });
          }
        }

        if (trackingNumber || carrier || status === 'SHIPPED') {
          const fulfillment = await tx.vendorFulfillment.findFirst({
            where: { orderId },
          });

          const trackingData: any = {
            status: (status as any) || 'PENDING',
            updatedAt: new Date(),
          };
          if (trackingNumber) trackingData.trackingNumber = trackingNumber;
          if (carrier) trackingData.carrier = carrier;

          if (fulfillment) {
            await tx.vendorFulfillment.update({
              where: { id: fulfillment.id },
              data: trackingData,
            });
          } else if (artisanId) {
            await tx.vendorFulfillment.create({
              data: {
                orderId,
                artisanId,
                trackingNumber: trackingNumber || 'TRK_MOCK_123',
                carrier: carrier || 'Cosmic Dispatch',
                status: (status as any) || 'PENDING',
              },
            });
          }
        }

        return order;
      });

      return NextResponse.json({ success: true, order: updatedOrder });
    }

    // ─── REVIEW MODERATION ────────────────────────────────
    if (action === 'moderateReview') {
      const { reviewId, moderationState, moderatorNotes } = body;
      const updatedReview = await db.review.update({
        where: { id: reviewId },
        data: {
          moderationState: moderationState as ModerationState,
          moderatorNotes,
        },
      });
      return NextResponse.json({ success: true, review: updatedReview });
    }

    // ─── DELETE PRODUCT ──────────────────────────────────────
    if (action === 'deleteProduct') {
      const { id } = body.data || body;
      if (!id) {
        return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
      }
      await db.product.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    // ─── PRODUCT CATALOG MANAGEMENT ────────────────────────
    if (action === 'upsertProduct') {
      const productInput = body.data || body;
      const { id, title, price, description, categoryId, imageUrl, galleryUrls, customizationConfig, isActive, isFeatured, isFestiveDrop } = productInput;
      
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const productData: any = {
        title,
        slug,
        price: parseFloat(price),
        description,
        categoryId,
        imageUrl: imageUrl || '/images/products/default.jpg',
        galleryUrls: galleryUrls || [],
        isFeatured: isFeatured ?? false,
        isFestiveDrop: isFestiveDrop ?? false,
        isActive: isActive ?? true,
      };

      if (customizationConfig && Object.keys(customizationConfig).length > 0) {
        productData.customizationConfig = customizationConfig;
      }

      let product;
      if (id) {
        product = await db.product.update({
          where: { id },
          data: productData,
          include: { category: true },
        });
      } else {
        if (!productData.customizationConfig) {
          productData.customizationConfig = {
            sizes: [
              { name: 'S', priceModifier: 0, description: 'Adjustable 14-16cm' },
              { name: 'M', priceModifier: 20, description: 'Adjustable 16-18cm' },
              { name: 'L', priceModifier: 40, description: 'Adjustable 18-20cm' }
            ],
            metals: [
              { name: 'Organic Cotton Thread', priceModifier: 0 }
            ],
            threadColors: [
              { name: 'Sage Olive', hex: '#3F6212', meaning: 'Growth and Serenity' },
              { name: 'Terracotta Clay', hex: '#C2410C', meaning: 'Grounding and Warmth' }
            ],
            charms: [
              { name: 'None', priceModifier: 0 },
              { name: 'Mini Zodiac Disc', priceModifier: 150 }
            ],
            packaging: [
              { name: 'Standard Kraft Envelope', priceModifier: 0 }
            ]
          };
        }
        product = await db.product.create({
          data: productData,
          include: { category: true },
        });
      }
      return NextResponse.json({ success: true, product });
    }

    // ─── LOYALTY WALLET ADJUSTMENT ─────────────────────────
    if (action === 'adjustPoints') {
      const { walletId, pointsChange, reason } = body;
      
      const wallet = await db.loyaltyWallet.findUnique({
        where: { id: walletId },
      });

      if (!wallet) {
        return NextResponse.json({ success: false, error: 'Loyalty wallet not found' }, { status: 404 });
      }

      const updatedWallet = await db.loyaltyWallet.update({
        where: { id: walletId },
        data: {
          points: {
            increment: parseInt(pointsChange),
          },
        },
      });

      // Log in ledger
      await db.loyaltyLedger.create({
        data: {
          walletId,
          points: parseInt(pointsChange),
          reason: reason || 'ADMIN_ADJUSTMENT',
          metadata: { message: `Manual adjustment by administrator` },
        },
      });

      return NextResponse.json({ success: true, wallet: updatedWallet });
    }

    // ─── EXPERIMENT TOGGLE ────────────────────────────────
    if (action === 'toggleExperiment') {
      const { experimentId, isActive } = body;
      const updatedExperiment = await db.experiment.update({
        where: { id: experimentId },
        data: {
          isActive,
        },
      });
      return NextResponse.json({ success: true, experiment: updatedExperiment });
    }

    return NextResponse.json({ success: false, error: 'Unsupported action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error handling admin post request:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to execute management action' },
      { status: 500 }
    );
  }
}
