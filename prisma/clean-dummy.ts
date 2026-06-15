import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function removeDummyProducts() {
  console.log('🧹 Starting cleanup of dummy products...');
  
  // Find all dummy products
  const dummyProducts = await prisma.product.findMany({
    where: { isDummy: true },
    select: { id: true, title: true }
  });
  
  if (dummyProducts.length === 0) {
    console.log('✨ No dummy products found.');
    return;
  }
  
  console.log(`Found ${dummyProducts.length} dummy products to remove:`);
  dummyProducts.forEach(p => console.log(` - ${p.title} (${p.id})`));
  
  const dummyIds = dummyProducts.map(p => p.id);
  
  // Clean up order items and other tables that might refer to these products manually
  // to avoid relational integrity issues.
  const orderItemsDeleted = await prisma.orderItem.deleteMany({
    where: { productId: { in: dummyIds } }
  });
  console.log(`🗑️ Deleted ${orderItemsDeleted.count} related OrderItems.`);

  // Clean up CartItems (which don't have an explicit Prisma relation but reference productId)
  const cartItemsDeleted = await prisma.cartItem.deleteMany({
    where: { productId: { in: dummyIds } }
  });
  console.log(`🗑️ Deleted ${cartItemsDeleted.count} related CartItems.`);

  // Clean up Wishlists (which reference productId as string)
  const wishlistDeleted = await prisma.wishlist.deleteMany({
    where: { productId: { in: dummyIds } }
  });
  console.log(`🗑️ Deleted ${wishlistDeleted.count} related Wishlist entries.`);

  // Clean up SavedDesigns (which reference productId as string)
  const savedDesignsDeleted = await prisma.savedDesign.deleteMany({
    where: { productId: { in: dummyIds } }
  });
  console.log(`🗑️ Deleted ${savedDesignsDeleted.count} related SavedDesigns.`);
  
  // Now delete the products themselves (cascade delete will clean variants, mappings, reviews, campaigns, etc.)
  const result = await prisma.product.deleteMany({
    where: { isDummy: true }
  });
  
  console.log(`✅ Successfully deleted ${result.count} dummy products!`);
}

// Allow running this script directly
if (require.main === module) {
  removeDummyProducts()
    .catch(err => {
      console.error('❌ Error cleaning dummy products:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
