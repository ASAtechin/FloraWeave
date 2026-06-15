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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let orders;
    if (userId) {
      orders = await db.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
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
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Admin backlog - return all orders
      orders = await db.order.findMany({
        include: {
          items: {
            include: {
              product: true,
            },
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
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    const formattedOrders = orders.map(formatOrder);
    return NextResponse.json({ success: true, orders: formattedOrders });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      contactName,
      contactPhone,
      contactEmail,
      shippingAddress,
      items,
      total,
      subtotal,
      shippingFee,
    } = body;

    if (!items || items.length === 0 || !contactPhone || !shippingAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required order fields' },
        { status: 400 }
      );
    }

    // Resolve structured address
    const resolvedAddress = typeof shippingAddress === 'string' 
      ? { street: shippingAddress, city: 'Bengaluru', state: 'Karnataka', postalCode: '560001', country: 'IN' }
      : {
          street: shippingAddress.street || '',
          city: shippingAddress.city || 'Bengaluru',
          state: shippingAddress.state || 'Karnataka',
          postalCode: shippingAddress.postalCode || '560001',
          country: shippingAddress.country || 'IN',
        };

    const calculatedSubtotal = subtotal || items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const calculatedShipping = shippingFee !== undefined ? shippingFee : (calculatedSubtotal > 999 ? 0 : 99);
    const calculatedTotal = total || (calculatedSubtotal + calculatedShipping);

    // Create order inside prisma transaction
    const order = await db.$transaction(async (tx) => {
      // 1. Create order
      const newOrder = await tx.order.create({
        data: {
          userId: userId || null,
          status: 'PENDING' as OrderStatus,
          subtotal: calculatedSubtotal,
          tax: 0,
          shippingFee: calculatedShipping,
          total: calculatedTotal,
          shippingAddress: resolvedAddress as any,
          billingAddress: resolvedAddress as any,
          contactPhone,
          contactEmail: contactEmail || 'seeker@cosmic.com',
          paymentStatus: 'UNPAID',
        },
      });

      // 2. Create order items and split artisan fulfillments
      const artisanIds = new Set<string>();

      for (const item of items) {
        // Fetch product to resolve correct artisan ID if possible
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });

        const artisanId = product?.artisanId || null;
        if (artisanId) {
          artisanIds.add(artisanId);
        }

        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            customizationData: item.customization || null,
            artisanId: artisanId,
          },
        });
      }

      // 3. Create vendor fulfillments for each unique artisan
      for (const artisanId of artisanIds) {
        await tx.vendorFulfillment.create({
          data: {
            orderId: newOrder.id,
            artisanId,
            status: 'PENDING',
          },
        });
      }

      // Re-fetch complete order with includes to format correctly
      return await tx.order.findUnique({
        where: { id: newOrder.id },
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

    if (!order) {
      return NextResponse.json({ success: false, error: 'Failed to find created order' }, { status: 500 });
    }

    return NextResponse.json({ success: true, orderId: order.id, order: formatOrder(order) });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
