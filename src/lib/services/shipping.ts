export interface AddressParams {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string; // "IN", "US", "EU", etc.
}

export interface ShippingQuote {
  carrier: string;
  rate: number;
  tax: number;
  duties: number;
  estimatedDays: number;
  craftingDays: number;
  deliveryDate: Date;
}

export class ShippingService {
  /**
   * Evaluates address syntax and returns if standard delivery is supported in that country.
   */
  static validateAddress(address: AddressParams): { isValid: boolean; error?: string } {
    if (!address.postalCode || address.postalCode.trim().length < 4) {
      return { isValid: false, error: 'Invalid postal code format' };
    }
    if (!address.country || address.country.trim().length !== 2) {
      return { isValid: false, error: 'Country must be a 2-letter ISO code' };
    }
    return { isValid: true };
  }

  /**
   * Calculates dynamic shipping rates, taxes, duties, and crafting ETA.
   */
  static calculateShippingQuote(
    address: AddressParams,
    cartTotal: number,
    rushOrder: boolean = false
  ): ShippingQuote {
    const isDomestic = address.country.toUpperCase() === 'IN';
    
    // Crafting overhead (Handweaving, metal plating takes 3 days, rush order cuts it to 1 day)
    const craftingDays = rushOrder ? 1 : 3;

    // Delivery times
    const transitDays = isDomestic ? 2 : 7;
    const estimatedDays = craftingDays + transitDays;

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + estimatedDays);

    // Domestic: standard 80 INR or free over 1000 INR.
    // International: 1500 INR (approx $20 USD)
    let rate = 0;
    if (isDomestic) {
      rate = cartTotal >= 1000 ? 0 : 80;
    } else {
      rate = 1500;
    }

    // Add rush order fee (flat 250 INR/approx $3 USD)
    if (rushOrder) {
      rate += 250;
    }

    // Muted tax & duties rates
    const gstRate = 0.03; // 3% standard on jewelry in India
    const tax = cartTotal * gstRate;

    // International customs duty mock (10% of total for non-domestic)
    const duties = isDomestic ? 0 : cartTotal * 0.10;

    return {
      carrier: isDomestic ? 'Delhivery Celestial' : 'FedEx Cosmic Express',
      rate,
      tax,
      duties,
      estimatedDays,
      craftingDays,
      deliveryDate
    };
  }
}
