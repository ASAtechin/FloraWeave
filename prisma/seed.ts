import { PrismaClient, Role, Tier, SubscriptionStatus, ModerationState } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing data
  await prisma.auditLog.deleteMany({});
  await prisma.securityEvent.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.savedDesign.deleteMany({});
  await prisma.aRSession.deleteMany({});
  await prisma.experimentAssignment.deleteMany({});
  await prisma.experiment.deleteMany({});
  await prisma.subscriptionLifecycle.deleteMany({});
  await prisma.subscriptionPlanProduct.deleteMany({});
  await prisma.subscriptionPlan.deleteMany({});
  await prisma.creatorCampaignProduct.deleteMany({});
  await prisma.creatorCampaign.deleteMany({});
  await prisma.creatorProfile.deleteMany({});
  await prisma.referralAttribution.deleteMany({});
  await prisma.referralCode.deleteMany({});
  await prisma.loyaltyLedger.deleteMany({});
  await prisma.loyaltyWallet.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.vendorFulfillment.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.birthFlowerMapping.deleteMany({});
  await prisma.zodiacMapping.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.artisanProfile.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.category.deleteMany({});

  console.log('🧹 Database cleaned.');

  // 2. Create Categories
  const categoryThreads = await prisma.category.create({
    data: { name: 'Handmade Threads', slug: 'threads', description: 'Artisanal woven cords and sacred threads' }
  });
  const categoryEarrings = await prisma.category.create({
    data: { name: 'Earrings', slug: 'earrings', description: 'Celestial drop and stud earrings' }
  });
  const categoryBracelets = await prisma.category.create({
    data: { name: 'Zodiac Bracelets', slug: 'bracelets', description: 'Beaded and metal zodiac bracelets' }
  });
  const categoryAnklets = await prisma.category.create({
    data: { name: 'Anklets', slug: 'anklets', description: 'Delicate customizable foot jewelry' }
  });
  const categoryCharms = await prisma.category.create({
    data: { name: 'Charms', slug: 'charms', description: 'Individual zodiac and flower symbol add-ons' }
  });
  const categoryGiftSets = await prisma.category.create({
    data: { name: 'Gift Sets', slug: 'gift-sets', description: 'Curated Zodiac & Birth flower bundle boxes' }
  });

  console.log('📁 Categories created.');

  // 3. Create Users & Profiles
  // Passwords are pre-hashed for simplicity (representing "password123")
  const dummyPasswordHash = '$2a$12$R.vGk8zM/f7xX6RkKjP0EemUfJbYVq1032g.nqy/6d9z2W3Y6D.sK';

  // Admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@chochete.com',
      passwordHash: dummyPasswordHash,
      role: Role.ADMIN,
      profile: {
        create: {
          firstName: 'Anya',
          lastName: 'Sharma',
          avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
          bio: 'Co-founder and curator of Chochete',
          phoneNumber: '+919999999999',
          gender: 'Female',
          zodiacSign: 'Scorpio',
          birthFlower: 'Chrysanthemum'
        }
      }
    }
  });

  // Artisan
  const artisanUser = await prisma.user.create({
    data: {
      email: 'artisan.celestial@chochete.com',
      passwordHash: dummyPasswordHash,
      role: Role.ARTISAN,
      profile: {
        create: {
          firstName: 'Devendra',
          lastName: 'Pratap',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          bio: 'Third generation threadweaver from Rajasthan',
          phoneNumber: '+918888888888',
          gender: 'Male',
          zodiacSign: 'Taurus',
          birthFlower: 'Hawthorn'
        }
      },
      artisanProfile: {
        create: {
          storeName: 'Celestial Weaves',
          storeSlug: 'celestial-weaves',
          bio: 'Earthy, hand-knotted sacred threads and gemstones',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          commissionRate: 0.12,
          verificationStatus: 'APPROVED',
          complianceMetadata: {
            panCard: 'ABCDE1234F',
            gstin: '08ABCDE1234F1Z5',
            bankAccount: '123456789012',
            ifsc: 'SBIN0001234'
          },
          qualityScore: 4.9
        }
      }
    },
    include: { artisanProfile: true }
  });

  // Creator
  const creatorUser = await prisma.user.create({
    data: {
      email: 'creator.aurora@chochete.com',
      passwordHash: dummyPasswordHash,
      role: Role.CREATOR,
      profile: {
        create: {
          firstName: 'Aurora',
          lastName: 'Vance',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          bio: 'Astrology creator & spiritual guide',
          phoneNumber: '+917777777777',
          gender: 'Female',
          zodiacSign: 'Pisces',
          birthFlower: 'Water Lily'
        }
      },
      creatorProfile: {
        create: {
          handle: 'aurorascope',
          displayName: 'Aurora Cosmic Edits',
          bio: 'Curated Zodiac pieces reflecting retrogrades and birth charts',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          commissionRate: 0.08,
          isActive: true
        }
      }
    },
    include: { creatorProfile: true }
  });

  // Customer
  const customerUser = await prisma.user.create({
    data: {
      id: 'buyer-luna-id',
      email: 'buyer.luna@chochete.com',
      passwordHash: dummyPasswordHash,
      role: Role.CUSTOMER,
      profile: {
        create: {
          firstName: 'Luna',
          lastName: 'Rose',
          avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
          bio: 'Zodiac and birth flower lover',
          phoneNumber: '+916666666666',
          gender: 'Female',
          zodiacSign: 'Cancer',
          birthFlower: 'Delphinium',
          currency: 'INR',
          language: 'en'
        }
      },
      loyaltyWallet: {
        create: {
          points: 150,
          tier: Tier.GOLD
        }
      },
      referralCode: {
        create: {
          code: 'LUNAROSE15'
        }
      }
    },
    include: { loyaltyWallet: true }
  });

  console.log('👤 Users, Profiles, Artisans, and Creators seeded.');

  // 4. Populate Loyalty Wallet Ledgers
  if (customerUser.loyaltyWallet) {
    await prisma.loyaltyLedger.createMany({
      data: [
        {
          walletId: customerUser.loyaltyWallet.id,
          points: 100,
          reason: 'SIGNUP',
          metadata: { message: 'Welcome to Chochete family!' }
        },
        {
          walletId: customerUser.loyaltyWallet.id,
          points: 50,
          reason: 'REVIEW',
          metadata: { reviewId: 'dummy-review-id', message: 'Review bonus' }
        }
      ]
    });
  }

  // 5. Create Products with Customization Engines
  // Customization rules are stored as JSON
  const defaultConfig = {
    sizes: [
      { name: 'S', priceModifier: 0, description: 'Adjustable 14-16cm' },
      { name: 'M', priceModifier: 20, description: 'Adjustable 16-18cm' },
      { name: 'L', priceModifier: 40, description: 'Adjustable 18-20cm' }
    ],
    metals: [
      { name: 'Organic Cotton Thread', priceModifier: 0 },
      { name: 'Pure Merino Wool', priceModifier: 150 },
      { name: 'Organic Bamboo Silk', priceModifier: 250 }
    ],
    threadColors: [
      { name: 'Crimson Red', hex: '#991B1B', meaning: 'Strength and Passion' },
      { name: 'Sage Olive', hex: '#3F6212', meaning: 'Growth and Serenity' },
      { name: 'Mustard Gold', hex: '#CA8A04', meaning: 'Intellect and Abundance' },
      { name: 'Terracotta Clay', hex: '#C2410C', meaning: 'Grounding and Warmth' },
      { name: 'Cosmic Indigo', hex: '#312E81', meaning: 'Intuition and Magic' }
    ],
    charms: [
      { name: 'None', priceModifier: 0 },
      { name: 'Mini Zodiac Disc', priceModifier: 150 },
      { name: 'Birth Flower Pendant', priceModifier: 180 },
      { name: 'Tiny Sacred Lotus', priceModifier: 120 }
    ],
    packaging: [
      { name: 'Standard Kraft Envelope', priceModifier: 0, description: 'Recycled minimalist paper sleeve' },
      { name: 'Premium Wooden Zodiac Keepsake Box', priceModifier: 199, description: 'Handcrafted box with custom zodiac wood engraving' }
    ],
    engravingLimit: 12
  };

  const product1 = await prisma.product.create({
    data: {
      title: 'Aura Alignment Thread Bracelet',
      slug: 'aura-alignment-thread-bracelet',
      description: 'Hand-woven sacred thread bracelet customized with your zodiac element, matching birthstone beads, and a custom metal seal. Designed for everyday intention.',
      price: 599.00,
      imageUrl: '/images/products/bracelet.png',
      galleryUrls: [
        '/images/products/bracelet.jpg',
        '/images/products/default.jpg'
      ],
      categoryId: categoryBracelets.id,
      artisanId: artisanUser.artisanProfile?.id,
      isFeatured: true,
      isDummy: true,
      customizationConfig: defaultConfig
    }
  });

  const productBracelets2 = await prisma.product.create({
    data: {
      title: 'Cosmic Element Beaded Bracelet',
      slug: 'cosmic-element-beaded-bracelet',
      description: 'Natural stone beads carefully chosen to represent your zodiac element (Earth, Air, Fire, Water), threaded on durable cords.',
      price: 499.00,
      imageUrl: '/images/products/bracelet-beads.png',
      categoryId: categoryBracelets.id,
      artisanId: artisanUser.artisanProfile?.id,
      isDummy: true,
      customizationConfig: defaultConfig
    }
  });

  const productBracelets3 = await prisma.product.create({
    data: {
      title: 'Lunar Phase Silver Cuff Bracelet',
      slug: 'lunar-phase-silver-cuff-bracelet',
      description: 'Elegant silver cuff engraved with the phases of the moon, customizable with your moon sign or custom engraving.',
      price: 999.00,
      imageUrl: '/images/products/bracelet-cuff.png',
      categoryId: categoryBracelets.id,
      isDummy: true,
      customizationConfig: defaultConfig
    }
  });

  const productBracelets4 = await prisma.product.create({
    data: {
      title: 'Celestial Alignment Bangle',
      slug: 'celestial-alignment-bangle',
      description: 'Dainty brass bangle with three stars representing your primary astrological placements (Sun, Moon, Rising).',
      price: 799.00,
      imageUrl: '/images/products/bracelet.png',
      categoryId: categoryBracelets.id,
      isDummy: true,
      customizationConfig: defaultConfig
    }
  });

  const productBracelets5 = await prisma.product.create({
    data: {
      title: 'Stellar Constellation Chain Bracelet',
      slug: 'stellar-constellation-chain-bracelet',
      description: 'Minimalist silver chain bracelet featuring a delicate pendant representing your zodiac constellation.',
      price: 899.00,
      imageUrl: '/images/products/bracelet.png',
      categoryId: categoryBracelets.id,
      isDummy: true,
      customizationConfig: defaultConfig
    }
  });

  const product2 = await prisma.product.create({
    data: {
      title: 'Celestial Constellation Drop Earrings',
      slug: 'celestial-constellation-drop-earrings',
      description: 'Dainty zodiac constellation layout earrings carefully handcrafted by local artisans, featuring real raw quartz chips and customizable metal plating.',
      price: 899.00,
      imageUrl: '/images/products/earrings.png',
      categoryId: categoryEarrings.id,
      artisanId: artisanUser.artisanProfile?.id,
      isFeatured: true,
      isDummy: true,
      customizationConfig: {
        ...defaultConfig,
        threadColors: [],
        charms: []
      }
    }
  });

  const productEarrings2 = await prisma.product.create({
    data: {
      title: 'Lunar Eclipse Hoop Earrings',
      slug: 'lunar-eclipse-hoop-earrings',
      description: 'Stunning asymmetric hoops depicting the progress of a lunar eclipse, featuring obsidian and silver accents.',
      price: 699.00,
      imageUrl: '/images/products/earrings-hoop.png',
      categoryId: categoryEarrings.id,
      artisanId: artisanUser.artisanProfile?.id,
      isDummy: true,
      customizationConfig: {
        ...defaultConfig,
        threadColors: [],
        charms: []
      }
    }
  });

  const productEarrings3 = await prisma.product.create({
    data: {
      title: 'Solar Flare Stud Earrings',
      slug: 'solar-flare-stud-earrings',
      description: 'Minimal studs in a radiating sunburst pattern, adorned with a tiny central citrine gemstone.',
      price: 399.00,
      imageUrl: '/images/products/earrings.png',
      categoryId: categoryEarrings.id,
      isDummy: true,
      customizationConfig: {
        ...defaultConfig,
        threadColors: [],
        charms: []
      }
    }
  });

  const productEarrings4 = await prisma.product.create({
    data: {
      title: 'Zodiac Motif Threader Earrings',
      slug: 'zodiac-motif-threader-earrings',
      description: 'Elegant threader earrings with fine chains that slide through the ear, featuring your personal zodiac symbol charms.',
      price: 549.00,
      imageUrl: '/images/products/earrings.png',
      categoryId: categoryEarrings.id,
      isDummy: true,
      customizationConfig: {
        ...defaultConfig,
        threadColors: [],
        charms: []
      }
    }
  });

  const productEarrings5 = await prisma.product.create({
    data: {
      title: 'Galactic Spiral Drop Earrings',
      slug: 'galactic-spiral-drop-earrings',
      description: 'Hypnotic spiral drops representing our home galaxy, handcrafted using eco-friendly sterling silver.',
      price: 749.00,
      imageUrl: '/images/products/earrings.png',
      categoryId: categoryEarrings.id,
      isDummy: true,
      customizationConfig: {
        ...defaultConfig,
        threadColors: [],
        charms: []
      }
    }
  });

  const product3 = await prisma.product.create({
    data: {
      title: 'Zodiac Silk Cord Anklet',
      slug: 'zodiac-silk-cord-anklet',
      description: 'Pure silk cords hand-knotted with sliding knots for adjustable sizing. Adorned with your zodiac symbol charm and small freshwater pearls.',
      price: 499.00,
      imageUrl: '/images/products/anklet.png',
      categoryId: categoryAnklets.id,
      artisanId: artisanUser.artisanProfile?.id,
      isDummy: true,
      customizationConfig: defaultConfig
    }
  });

  const product5 = await prisma.product.create({
    data: {
      title: 'Zodiac Flower Anklets',
      slug: 'zodiac-flower-anklets',
      description: '12 Zodiac Signs ~ 12 Flowers. Handcrafted with love. 100% yarn handmade, lightweight & comfortable, adjustable fit for all. Boho & nature inspired.',
      price: 699.00,
      imageUrl: '/images/products/zodiac-flower-anklets.jpeg',
      categoryId: categoryAnklets.id,
      artisanId: artisanUser.artisanProfile?.id,
      isFeatured: true,
      isDummy: true,
      customizationConfig: {
        ...defaultConfig,
        metals: [
           { name: '100% Cotton Yarn', priceModifier: 0 }
        ],
        charms: [
           { name: 'Carnation (Aries)', priceModifier: 0 },
           { name: 'Rose (Taurus)', priceModifier: 0 },
           { name: 'Lavender (Gemini)', priceModifier: 0 },
           { name: 'Water Lily (Cancer)', priceModifier: 0 },
           { name: 'Sunflower (Leo)', priceModifier: 0 },
           { name: 'Daisy (Virgo)', priceModifier: 0 },
           { name: 'Pink Rose (Libra)', priceModifier: 0 },
           { name: 'Chrysanthemum (Scorpio)', priceModifier: 0 },
           { name: 'Bird of Paradise (Sagittarius)', priceModifier: 0 },
           { name: 'Snowdrop (Capricorn)', priceModifier: 0 },
           { name: 'Orchid (Aquarius)', priceModifier: 0 },
           { name: 'Lotus (Pisces)', priceModifier: 0 }
        ]
      }
    }
  });

  const productAnklets3 = await prisma.product.create({
    data: {
      title: 'Bohemian Seashell Charm Anklet',
      slug: 'bohemian-seashell-charm-anklet',
      description: 'A beachy cotton thread anklet braided with natural cowrie shells, adjustable and water-resistant.',
      price: 349.00,
      imageUrl: '/images/products/anklet-shell.png',
      categoryId: categoryAnklets.id,
      artisanId: artisanUser.artisanProfile?.id,
      isDummy: true,
      customizationConfig: defaultConfig
    }
  });

  const productAnklets4 = await prisma.product.create({
    data: {
      title: 'Sacred Geometry Beaded Anklet',
      slug: 'sacred-geometry-beaded-anklet',
      description: 'Delicate anklet featuring gold geometric charms representing the classical elements of nature.',
      price: 449.00,
      imageUrl: '/images/products/anklet.png',
      categoryId: categoryAnklets.id,
      isDummy: true,
      customizationConfig: defaultConfig
    }
  });

  const productAnklets5 = await prisma.product.create({
    data: {
      title: 'Cosmic Dust Silver Chain Anklet',
      slug: 'cosmic-dust-silver-chain-anklet',
      description: 'Fine sterling silver chain anklet dotted with tiny raw moonstone beads that catch the light like cosmic dust.',
      price: 599.00,
      imageUrl: '/images/products/anklet.png',
      categoryId: categoryAnklets.id,
      isDummy: true,
      customizationConfig: defaultConfig
    }
  });

  const product4 = await prisma.product.create({
    data: {
      title: 'Sacred Knot Protection Thread',
      slug: 'sacred-knot-protection-thread',
      description: 'Traditional handcrafted crimson red protection thread featuring sacred knots and gold charms. Blessed by local artisans.',
      price: 199.00,
      imageUrl: '/images/products/bracelet.png',
      categoryId: categoryThreads.id,
      isFeatured: true,
      isDummy: true,
      customizationConfig: defaultConfig
    }
  });

  const productThreads2 = await prisma.product.create({
    data: {
      title: 'Kabbalah Red String Thread',
      slug: 'kabbalah-red-string-thread',
      description: 'Sacred red string thread to ward off negative energies and evil eye, hand-tied with sliding adjustment.',
      price: 149.00,
      imageUrl: '/images/products/bracelet.png',
      categoryId: categoryThreads.id,
      artisanId: artisanUser.artisanProfile?.id,
      isDummy: true,
      customizationConfig: defaultConfig
    }
  });

  const productThreads3 = await prisma.product.create({
    data: {
      title: 'Seven Knots Spiritual Thread',
      slug: 'seven-knots-spiritual-thread',
      description: 'Crimson woven cotton thread knotted seven times to represent protection, spiritual alignment, and focus.',
      price: 179.00,
      imageUrl: '/images/products/bracelet.png',
      categoryId: categoryThreads.id,
      isDummy: true,
      customizationConfig: defaultConfig
    }
  });

  const productThreads4 = await prisma.product.create({
    data: {
      title: 'Artisan Braided Cotton Thread',
      slug: 'artisan-braided-cotton-thread',
      description: 'Multi-color hand-braided thread cords, perfect for layering or wearing as simple, durable daily intentions.',
      price: 249.00,
      imageUrl: '/images/products/bracelet.png',
      categoryId: categoryThreads.id,
      isDummy: true,
      customizationConfig: defaultConfig
    }
  });

  const productThreads5 = await prisma.product.create({
    data: {
      title: 'Zodiac Element Woven Cord',
      slug: 'zodiac-element-woven-cord',
      description: 'Durable woven thread cord dyed in colors matching your zodiac sign element (Fire, Earth, Air, Water).',
      price: 299.00,
      imageUrl: '/images/products/bracelet.png',
      categoryId: categoryThreads.id,
      isDummy: true,
      customizationConfig: defaultConfig
    }
  });

  console.log('💎 Products seeded.');

  // 6. Seed Product Variants
  await prisma.productVariant.createMany({
    data: [
      { productId: product1.id, sku: 'AURA-BR-COT-S', title: 'Cotton / Small', price: 599.00, stock: 15, meta: { metal: 'Organic Cotton Thread', size: 'S' } },
      { productId: product1.id, sku: 'AURA-BR-WOL-M', title: 'Wool / Medium', price: 749.00, stock: 30, meta: { metal: 'Pure Merino Wool', size: 'M' } },
      { productId: product1.id, sku: 'AURA-BR-SLK-M', title: 'Silk / Medium', price: 849.00, stock: 25, meta: { metal: 'Organic Bamboo Silk', size: 'M' } }
    ]
  });

  // 7. Seed Zodiac & Birth Flower Mappings
  await prisma.zodiacMapping.createMany({
    data: [
      { zodiacSign: 'Cancer', productId: product1.id, storyText: 'Cancer is ruled by the Moon. The Sage Olive thread combined with sterling silver balances the emotional water element, fostering inner sanctuary and calm.' },
      { zodiacSign: 'Leo', productId: product1.id, storyText: 'Leo is ruled by the Sun. Gold finish and Crimson Red cords amplify your natural fire and radiant creativity.' },
      { zodiacSign: 'Pisces', productId: product2.id, storyText: 'Dreamy Pisces finds compatibility with raw quartz drops, absorbing mental noise and amplifying intuitive psychic channels.' },
      { zodiacSign: 'Cancer', productId: product4.id, storyText: 'A grounding water-element gift package with a moonstone bracelet and rose-scented soy candle.' }
    ]
  });

  await prisma.birthFlowerMapping.createMany({
    data: [
      { birthFlower: 'Delphinium', productId: product1.id, storyText: 'July birth flower, Delphinium, represents positivity, open hearts, and goodwill. Knitted into your thread bracelet for a lifetime of cheer.' },
      { birthFlower: 'Rose', productId: product2.id, storyText: 'June birth flower, Rose, symbolizes passion and beauty. Complements the constellation drops with classic charm.' }
    ]
  });

  console.log('🌌 Zodiac and Birth Flower Mappings configured.');

  // 8. Create Creator Campaigns
  const creatorCampaign = await prisma.creatorCampaign.create({
    data: {
      creatorId: creatorUser.creatorProfile!.id,
      title: 'Summer Solstice Magic',
      slug: 'summer-solstice-magic',
      description: 'A curated capsule collection to celebrate light, warmth, and retrogrades. Handcrafted options chosen by Aurora.',
      bannerUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&auto=format&fit=crop&q=80',
      isActive: true
    }
  });

  await prisma.creatorCampaignProduct.create({
    data: {
      campaignId: creatorCampaign.id,
      productId: product1.id
    }
  });

  // 9. Create Subscription Plans
  const subPlan1 = await prisma.subscriptionPlan.create({
    data: {
      name: 'Monthly Zodiac Surprise Box',
      description: 'Receive one custom zodiac accessory tailored to your active moon sign, planetary transits, and elemental energy of the month.',
      price: 799.00,
      interval: 'MONTHLY',
      isActive: true
    }
  });

  const subPlan2 = await prisma.subscriptionPlan.create({
    data: {
      name: 'Quarterly Festive Drop Box',
      description: 'Celebrate the solstice and seasonal equinoxes with premium limited edition artisan-designed necklaces, tops, and threads.',
      price: 1999.00,
      interval: 'QUARTERLY',
      isActive: true
    }
  });

  await prisma.subscriptionPlanProduct.createMany({
    data: [
      { planId: subPlan1.id, productId: product1.id },
      { planId: subPlan2.id, productId: product4.id }
    ]
  });

  // Create one active subscription for our customer
  await prisma.subscriptionLifecycle.create({
    data: {
      userId: customerUser.id,
      planId: subPlan1.id,
      status: SubscriptionStatus.ACTIVE,
      nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // In 30 days
      giftToName: 'Sarah Rose',
      giftToEmail: 'sarah@example.com',
      giftNote: 'Happy celestial alignment, sis!'
    }
  });

  console.log('📬 Subscriptions & campaigns seeded.');

  // 10. Seed Reviews (with moderation status)
  await prisma.review.create({
    data: {
      productId: product1.id,
      userId: customerUser.id,
      rating: 5,
      title: 'So personal and beautifully wrapped!',
      body: 'I chose the Sage Olive cord with a Cancer silver disk and the Delphinium backing card. It feels so heavy, luxurious, and meaningful. The handwritten gift note was lovely!',
      images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&auto=format&fit=crop&q=80'],
      moderationState: ModerationState.APPROVED,
      customizationSummary: 'Thread: Sage Olive, Metal: Sterling Silver 925, Charm: Cancer Zodiac Disc'
    }
  });

  // 11. Seed A/B Experiments
  const experiment = await prisma.experiment.create({
    data: {
      name: 'EX_AI_STYLIST_POSITION',
      description: 'Test whether AI Stylist assistant floats on the homepage vs embedded in products.',
      variations: ['FLOATING', 'EMBEDDED'],
      isActive: true
    }
  });

  await prisma.experimentAssignment.create({
    data: {
      experimentId: experiment.id,
      userId: customerUser.id,
      variation: 'FLOATING',
      converted: true
    }
  });

  console.log('🧪 A/B Testing Experiments seeded.');
  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
