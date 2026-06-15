import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const profile = await db.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json({
        success: true,
        profile: {
          firstName: 'Seeker',
          lastName: '',
          zodiacSign: 'Cancer',
          birthFlower: 'Delphinium',
          birthDate: null,
        }
      });
    }

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve profile' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, name, zodiacSign, birthFlower, birthDate } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    // Parse names
    const parts = (name || 'Seeker').trim().split(' ');
    const firstName = parts[0] || 'Seeker';
    const lastName = parts.slice(1).join(' ') || '';

    // Check if User exists. If not, create one to satisfy foreign key constraints.
    let user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      // Create user
      user = await db.user.create({
        data: {
          id: userId,
          email: `${userId}@chochete.com`,
          passwordHash: '$2a$12$R.vGk8zM/f7xX6RkKjP0EemUfJbYVq1032g.nqy/6d9z2W3Y6D.sK', // dummy
          role: 'CUSTOMER',
        }
      });
      // Also seed a loyalty wallet for them
      await db.loyaltyWallet.create({
        data: {
          userId: userId,
          points: 100,
        }
      });
    }

    // Convert birthDate string (DD/MM/YYYY) to Date object if provided
    let resolvedBirthDate: Date | null = null;
    if (birthDate) {
      const dateParts = birthDate.split('/');
      if (dateParts.length === 3) {
        const d = parseInt(dateParts[0], 10);
        const m = parseInt(dateParts[1], 10) - 1; // 0-indexed month
        const y = parseInt(dateParts[2], 10);
        if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
          resolvedBirthDate = new Date(y, m, d);
        }
      }
    }

    // Upsert Profile
    const profile = await db.profile.upsert({
      where: { userId },
      update: {
        firstName,
        lastName,
        zodiacSign,
        birthFlower,
        birthDate: resolvedBirthDate,
      },
      create: {
        userId,
        firstName,
        lastName,
        zodiacSign,
        birthFlower,
        birthDate: resolvedBirthDate,
      },
    });

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error('Error saving profile:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save profile' },
      { status: 500 }
    );
  }
}
