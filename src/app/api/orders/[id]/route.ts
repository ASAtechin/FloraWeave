import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { OrderStatus } from '@prisma/client';

function formatOrder(order: any) {
  if (!order) return null;
  
  // Resolve artisan name from fulfillmentOrders or items
  let artisanName = undefined;
  if (order.fulfillmentOrders && order.fulfillmentOrders.length > 0) {
    const firstFulfillment = order.fulfillmentOrders[0];
    if (firstFulfillment.artisan) {
      const profile = firstFulfillment.artisan.user?.profile;
      if (profile) {
        artisanName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || firstFulfillment.artisan.storeName;
      } else {
        artisanName = firstFulfillment.artisan.storeName;
      }
    }
  }

  // Map to the structure expected by the frontend
  return {
    id: order.id,
    date: order.createdAt.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    items: order.items.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      title: item.product?.title || 'Celestial Accessory',
      price: item.price,
      imageUrl: item.product?.imageUrl || 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a',
      quantity: item.quantity,
      customization: item.customizationData || {},
    })),
    total: order.total,
    status: order.status,
    artisanName,
    shippingAddress: order.shippingAddress,
    contactPhone: order.contactPhone,
    contactEmail: order.contactEmail,
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        },
        fulfillmentOrders: {
          include: {
            artisan: {
              include: {
                user: {
                  include: {
                    profile: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order: formatOrder(order) });
  } catch (error: any) {
    console.error('Order tracking API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve order status' },
      { status: 500 }
    );
  }
}

// Artisan updates tracking stage & allocation
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();
    const { status, trackingNumber, carrier, artisanName } = body;

    // 1. Resolve Artisan ID if artisanName is provided
    let artisanId: string | null = null;
    if (artisanName) {
      const parts = artisanName.split(' ');
      const searchName = parts[0] || artisanName;
      
      const artisan = await db.artisanProfile.findFirst({
        where: {
          OR: [
            { storeName: { contains: searchName, mode: 'insensitive' } },
            { user: { profile: { firstName: { contains: searchName, mode: 'insensitive' } } } }
          ]
        }
      });
      if (artisan) {
        artisanId = artisan.id;
      }
    }

    // Update inside prisma transaction to maintain integrity
    const updatedOrder = await db.$transaction(async (tx) => {
      // Update order status if provided
      const orderUpdateData: any = {
        updatedAt: new Date(),
      };
      if (status) {
        orderUpdateData.status = status as OrderStatus;
      }

      const order = await tx.order.update({
        where: { id },
        data: orderUpdateData,
        include: {
          items: true
        }
      });

      // Update artisan allocation on items & fulfillments
      if (artisanId) {
        await tx.orderItem.updateMany({
          where: { orderId: id },
          data: { artisanId }
        });

        // Check if fulfillment exists
        const fulfillment = await tx.vendorFulfillment.findFirst({
          where: { orderId: id }
        });

        if (fulfillment) {
          await tx.vendorFulfillment.update({
            where: { id: fulfillment.id },
            data: { artisanId }
          });
        } else {
          await tx.vendorFulfillment.create({
            data: {
              orderId: id,
              artisanId,
              status: status || 'PENDING'
            }
          });
        }
      }

      // If order is shipped, update vendor fulfillments
      if (status === 'SHIPPED') {
        await tx.vendorFulfillment.updateMany({
          where: { orderId: id },
          data: {
            status: 'SHIPPED',
            trackingNumber: trackingNumber || 'TRK_MOCK_123',
            carrier: carrier || 'Cosmic Dispatch',
            updatedAt: new Date(),
          }
        });
      }

      // Re-fetch complete order with includes to format correctly
      return await tx.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: true
            }
          },
          fulfillmentOrders: {
            include: {
              artisan: {
                include: {
                  user: {
                    include: {
                      profile: true
                    }
                  }
                }
              }
            }
          }
        }
      });
    });

    return NextResponse.json({ success: true, order: formatOrder(updatedOrder) });
  } catch (error: any) {
    console.error('Order status patch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order tracking stage' },
      { status: 500 }
    );
  }
}
