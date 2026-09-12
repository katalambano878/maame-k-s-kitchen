import { NextResponse } from 'next/server';
import { getMealPrepWeekPayload } from '@/lib/meal-prep-week';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const payload = await getMealPrepWeekPayload();
    return NextResponse.json(payload);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load weekly menu';
    console.error('[meal-prep/week]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
