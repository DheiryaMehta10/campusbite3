import { NextResponse } from 'next/server';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

export function corsResponse(body: any, init?: ResponseInit) {
  const headers = {
    ...corsHeaders,
    ...(init?.headers || {}),
  };
  return NextResponse.json(body, { ...init, headers });
}

export function handleCorsOptions() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}
