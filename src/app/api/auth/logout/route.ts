/**
 * @file route.ts
 * @description API route handler for clearing user authentication session cookies.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  return NextResponse.json({ success: true });
}
