import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get('url');

  if (!fileUrl) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  try {
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Try to guess filename from URL
    let filename = 'Refreshing-Resource';
    try {
      const parsedUrl = new URL(fileUrl);
      const parts = parsedUrl.pathname.split('/');
      const lastPart = parts[parts.length - 1];
      if (lastPart) {
        // Remove query parameters if any are accidentally included in the pathname part
        filename = decodeURIComponent(lastPart).split('?')[0];
      }
    } catch (e) {
      // fallback
    }

    // Force attachment
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);

    return new NextResponse(response.body, {
      headers,
    });
  } catch (error: any) {
    console.error('Download proxy error:', error);
    return new NextResponse(`Download failed`, { status: 500 });
  }
}
