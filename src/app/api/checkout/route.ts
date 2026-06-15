import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ShippingService } from '@/lib/services/shipping';
import { PaymentService } from '@/lib/services/payment';
import { MessagingService } from '@/lib/services/messaging';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      cartItems,
      shippingAddress,
      billingAddress,
      contactPhone,
      contactEmail,
      userId,
      appliedPoints = 0,
      rushOrder = false,
      currency = 'INR'
    } = body;

    if (!cartItems || cartItems.length === 0 || !shippingAddress || !contactPhone || !contactEmail) {
      return NextResponse.json({ success: false, error: 'Incomplete order details' }, { status: 400 });
    }

    // 1. Validate shipping address
    const addressValidation = ShippingService.validateAddress({
      street: shippingAddress.street || '',
      city: shippingAddress.city || '',
      state: shippingAddress.state || '',
      postalCode: shippingAddress.postalCode || '',
      country: shippingAddress.country || 'IN',
    });

    if (!addressValidation.isValid) {
      return NextResponse.json({ success: false, error: addressValidation.error || 'Invalid address' }, { status: 400 });
    }

    // 2. Fetch products and calculate pricing totals to avoid client-side tampering
    let subtotal = 0;
    const dbOrderItemsData: any[] = [];
    const vendorSplitData: Record<string, number> = {};

    for (const item of cartItems) {
      const product = await db.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return NextResponse.json({ success: false, error: `Product not found: ${item.title}` }, { status: 404 });
      }

      // Base price + customization modifier recalculation
      let itemPrice = product.price;
      const custom = item.customization;

      // Add base cord material pricing modifier (organic thread options)
      if (custom.metalFinish === 'Pure Merino Wool') itemPrice += 150;
      if (custom.metalFinish === 'Organic Bamboo Silk') itemPrice += 250;

      // Add charm modifier
      if (custom.charm === 'Mini Zodiac Disc') itemPrice += 150;
      if (custom.charm === 'Birth Flower Pendant') itemPrice += 180;
      if (custom.charm === 'Tiny Sacred Lotus') itemPrice += 120;

      // Add packaging modifier
      if (custom.packaging === 'Premium Wooden Zodiac Keepsake Box') itemPrice += 199;

      const lineTotal = itemPrice * item.quantity;
      subtotal += lineTotal;

      // Save item parameters for DB OrderItem inserts
      dbOrderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: itemPrice,
        customizationData: custom,
        artisanId: product.artisanId,
        fulfillmentStatus: 'PENDING'
      });

      // Split order fulfillment track by artisan
      if (product.artisanId) {
        vendorSplitData[product.artisanId] = (vendorSplitData[product.artisanId] || 0) + lineTotal;
      }
    }

    // 3. Resolve Loyalty points redemption
    let loyaltyDiscount = 0;
    let pointsToDeduct = 0;

    if (userId && appliedPoints > 0) {
      const wallet = await db.loyaltyWallet.findUnique({ where: { userId } });
      if (wallet && wallet.points >= appliedPoints) {
        // Redeem 1 point = 1 INR. Limit discount to 30% of subtotal.
        const maxDiscount = subtotal * 0.3;
        pointsToDeduct = Math.min(appliedPoints, wallet.points, Math.floor(maxDiscount));
        loyaltyDiscount = pointsToDeduct;
      }
    }

    // 4. Shipping, taxes and custom duties quotes
    const quote = ShippingService.calculateShippingQuote(
      {
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
      },
      subtotal,
      rushOrder
    );

    const total = subtotal + quote.rate + quote.tax + quote.duties - loyaltyDiscount;

    // 5. Generate Order entries in database
    const order = await db.order.create({
      data: {
        userId: userId || null,
        currency,
        subtotal,
        discount: 0, // General coupon discounts could apply here
        tax: quote.tax,
        shippingFee: quote.rate,
        loyaltyDiscount,
        total,
        pointsEarned: Math.floor(subtotal / 10), // Earn 1 point per 10 INR spent
        pointsRedeemed: pointsToDeduct,
        shippingAddress: shippingAddress as any,
        billingAddress: (billingAddress || shippingAddress) as any,
        contactPhone,
        contactEmail,
        paymentStatus: 'UNPAID',
        status: 'PENDING',
        items: {
          create: dbOrderItemsData
        }
      },
      include: {
        items: true
      }
    });

    // 6. Split vendor fulfillments entries for multi-artisan checkout
    for (const artisanId of Object.keys(vendorSplitData)) {
      await db.vendorFulfillment.create({
        data: {
          orderId: order.id,
          artisanId,
          status: 'PENDING',
        }
      });
    }

    // 7. Initiate payment intent from Payment service
    // Stripe charges in smallest currency sub-units (e.g. cents/paise). Convert total.
    const minorUnitMultiplier = currency.toUpperCase() === 'INR' ? 100 : 100;
    const payment = await PaymentService.createPaymentIntent({
      amount: total * minorUnitMultiplier,
      currency,
      orderId: order.id,
      customerEmail: contactEmail,
    });

    // Update order with payment tracker
    await db.order.update({
      where: { id: order.id },
      data: {
        paymentIntentId: payment.transactionId,
      }
    });

    // 8. Deduct loyalty points and register in ledger
    if (userId && pointsToDeduct > 0) {
      const wallet = await db.loyaltyWallet.findUnique({ where: { userId } });
      if (wallet) {
        await db.loyaltyWallet.update({
          where: { id: wallet.id },
          data: { points: { decrement: pointsToDeduct } }
        });
        await db.loyaltyLedger.create({
          data: {
            walletId: wallet.id,
            points: -pointsToDeduct,
            reason: 'REDEEM',
            metadata: { orderId: order.id }
          }
        });
      }
    }

    // 9. Send WhatsApp order updates (mocked/audited)
    await MessagingService.sendWhatsAppNotification({
      phoneNumber: contactPhone,
      templateName: 'order_received_celestial',
      languageCode: 'en',
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: order.id.slice(0, 8) },
            { type: 'text', text: `INR ${total.toFixed(2)}` }
          ]
        }
      ]
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      paymentIntent: payment,
    });
  } catch (error: any) {
    console.error('Checkout processing error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process checkout transaction' },
      { status: 500 }
    );
  }
}
