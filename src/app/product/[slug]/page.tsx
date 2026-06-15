import { Suspense } from 'react';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import ProductDetailClient from './ProductDetailClient';
import StellarSky from '@/components/ui/StellarSky';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const product = await db.product.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: {
        where: { moderationState: 'APPROVED' },
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
        }
      },
      zodiacMappings: true,
      birthFlowerMappings: true
    }
  });

  if (!product) {
    notFound();
  }

  // Cast Json configs safely
  const config = product.customizationConfig as any;

  return (
    <div className="flex flex-col min-h-screen relative bg-space-950 text-foreground overflow-hidden">
      <StellarSky />
      <Header />
      <main className="flex-1 relative z-10">
        <Suspense fallback={
          <div className="flex-grow flex items-center justify-center py-24 relative z-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold-400" />
          </div>
        }>
          <ProductDetailClient product={product} initialConfig={config} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
