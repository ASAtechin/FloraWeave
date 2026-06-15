import { db } from '@/lib/db';
import CosmicVoyagePage from '@/components/ui/CosmicVoyagePage';

export const revalidate = 60;

export default async function VoyagePage() {
  const products = await db.product.findMany({
    where: { isActive: true },
    include: { category: true },
    take: 6,
    orderBy: { rating: 'desc' },
  });

  const artisans = await db.artisanProfile.findMany({
    where: { verificationStatus: 'APPROVED' },
    take: 4,
  });

  const zodiacSigns = [
    { name: 'Aries', date: 'Mar 21 - Apr 19', element: 'Fire', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
    { name: 'Taurus', date: 'Apr 20 - May 20', element: 'Earth', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { name: 'Gemini', date: 'May 21 - Jun 20', element: 'Air', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    { name: 'Cancer', date: 'Jun 21 - Jul 22', element: 'Water', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { name: 'Leo', date: 'Jul 23 - Aug 22', element: 'Fire', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    { name: 'Virgo', date: 'Aug 23 - Sep 22', element: 'Earth', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { name: 'Libra', date: 'Sep 23 - Oct 22', element: 'Air', color: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
    { name: 'Scorpio', date: 'Oct 23 - Nov 21', element: 'Water', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    { name: 'Sagittarius', date: 'Nov 22 - Dec 21', element: 'Fire', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
    { name: 'Capricorn', date: 'Dec 22 - Jan 19', element: 'Earth', color: 'bg-stone-500/10 text-stone-400 border-stone-500/20' },
    { name: 'Aquarius', date: 'Jan 20 - Feb 18', element: 'Air', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
    { name: 'Pisces', date: 'Feb 19 - Mar 20', element: 'Water', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  ];

  return <CosmicVoyagePage products={products} artisans={artisans} zodiacSigns={zodiacSigns} />;
}
