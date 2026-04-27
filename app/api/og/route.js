import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const name = searchParams.get('name') || 'Celestial Discovery';
    const date = searchParams.get('date') || 'Cosmic Time';
    const constellation = searchParams.get('constellation') || 'Deep Space';
    const distance = searchParams.get('distance') || '—';
    const imageUrl = searchParams.get('img') || 'https://apod.nasa.gov/apod/image/0001/deepfield_hst_big.jpg';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#050810',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background Image with opacity */}
          <img 
            src={imageUrl} 
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.4,
            }}
          />

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            padding: '40px',
            position: 'relative',
            zIndex: 10,
          }}>
             {/* Star Icon Circle */}
             <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '60px',
                border: '2px solid rgba(201,168,76,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '30px',
                backgroundColor: 'rgba(5, 8, 16, 0.5)',
             }}>
                <span style={{ color: '#c9a84c', fontSize: '60px' }}>✦</span>
             </div>

             {/* Text Content */}
             <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
             }}>
                <div style={{ 
                  fontSize: '80px', 
                  fontFamily: 'serif',
                  fontStyle: 'italic',
                  color: '#c9a84c',
                  marginBottom: '10px'
                }}>
                  {name}
                </div>
                <div style={{ 
                  fontSize: '24px', 
                  color: 'rgba(255,255,255,0.6)', 
                  letterSpacing: '4px',
                  textTransform: 'uppercase'
                }}>
                  {date}
                </div>
             </div>

             {/* Footer Info */}
             <div style={{
                position: 'absolute',
                bottom: '40px',
                display: 'flex',
                gap: '20px',
                color: 'rgba(255,255,255,0.4)',
                fontSize: '18px',
                letterSpacing: '1px'
             }}>
                <span>{constellation}</span>
                <span>•</span>
                <span>{distance} LY</span>
             </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    return new Response(`Failed to generate the image`, { status: 500 });
  }
}
