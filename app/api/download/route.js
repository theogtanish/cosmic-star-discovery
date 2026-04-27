export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new Response('Missing URL parameter', { status: 400 });
  }

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    const arrayBuffer = await response.arrayBuffer();

    // Extract filename from URL or generate one
    const filename = url.split('/').pop() || 'cosmic-discovery.jpg';

    return new Response(arrayBuffer, {
      headers: {
        'Content-Type': contentType || 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return new Response('Error downloading image', { status: 500 });
  }
}
