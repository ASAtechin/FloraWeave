import { NextResponse } from 'next/server';
import { AIService, RecommendationInput } from '@/lib/services/ai';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { zodiac, recipient, occasion, budget, style, userId } = body;

    if (!zodiac || !recipient || !occasion || !budget || !style) {
      return NextResponse.json(
        { success: false, error: 'Missing required configuration parameters' },
        { status: 400 }
      );
    }

    const input: RecommendationInput = {
      zodiac,
      recipient,
      occasion,
      budget: parseFloat(budget),
      style,
    };

    // 1. Get Recommendations from AI service
    const recommendations = await AIService.getRecommendations(input);

    // 2. Write Recommendation Session in DB for analytics
    const session = await db.recommendationSession.create({
      data: {
        userId: userId || null,
        inputs: input as any,
        outcomes: {
          create: recommendations.map((r) => ({
            productId: r.productId,
            recoReason: r.reason,
            accepted: false,
          })),
        },
      },
      include: { outcomes: true },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      recommendations,
    });
  } catch (error: any) {
    console.error('AI Stylist API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal AI Recommendation Error' },
      { status: 500 }
    );
  }
}
