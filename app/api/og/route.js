import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Get parameters
    const name = searchParams.get('name') || 'Celestial Discovery';
    const date = searchParams.get('date') || 'Cosmic Time';
    const constellation = searchParams.get('constellation') || 'The Heavens';
    const distance = searchParams.get('distance') || 'Unknown';
    const type = searchParams.get('type') || 'Unknown';
    const temp = searchParams.get('temp') || 'Unknown';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#020408',
            padding: '60px',
            fontFamily: 'sans-serif',
            color: '#F0EDE6',
            position: 'relative',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '60px' }}>
            <div style={{ 
              display: 'flex', 
              padding: '6px 20px', 
              border: '1px solid rgba(255,255,255,0.2)', 
              borderRadius: '20px',
              fontSize: '18px',
              color: 'rgba(255,255,255,0.6)',
              letterSpacing: '2px'
            }}>
              NASA · APOD · {date.toUpperCase()}
            </div>
            <div style={{ 
              fontSize: '20px', 
              color: '#C9A84C', 
              letterSpacing: '4px',
              fontWeight: 'bold'
            }}>
              STAR-DISCOVERY.APP
            </div>
          </div>

          {/* Body */}
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
            <div style={{ 
              fontSize: '100px', 
              fontWeight: 'bold', 
              color: '#C9A84C',
              marginBottom: '10px',
              fontStyle: 'italic'
            }}>
              {name}
            </div>
            
            <div style={{ 
              fontSize: '24px', 
              color: 'rgba(255,255,255,0.6)', 
              letterSpacing: '1px',
              marginBottom: '40px'
            }}>
              Discovered on your date · {constellation} · {distance} LY
            </div>

            {/* Stats Row */}
            <div style={{ display: 'flex', gap: '60px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '32px', color: '#C9A84C', fontWeight: 'bold' }}>{distance}</div>
                <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px' }}>LY</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '32px', color: '#C9A84C', fontWeight: 'bold' }}>{type}</div>
                <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px' }}>TYPE</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '32px', color: '#C9A84C', fontWeight: 'bold' }}>{temp}</div>
                <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px' }}>K TEMP</div>
              </div>
            </div>
          </div>

          {/* Accent decoration */}
          <div style={{ 
            position: 'absolute', 
            bottom: '60px', 
            right: '60px', 
            width: '200px', 
            height: '200px', 
            borderRadius: '100px', 
            background: 'radial-gradient(circle, rgba(201,168,76,0.1) 0%, rgba(201,168,76,0) 70%)'
          }} />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
