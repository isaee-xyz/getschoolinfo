import { ImageResponse } from 'next/og';
import { MOCK_SCHOOLS } from '@/constants';

export const runtime = 'edge';

// Image metadata
export const alt = 'School Details';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: { id: string } }) {
    const school = MOCK_SCHOOLS.find((s) => s.id === params.id);

    if (!school) {
        return new ImageResponse(
            (
                <div
                    style={{
                        fontSize: 48,
                        background: 'linear-gradient(to bottom right, #1e293b, #0f172a)',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                    }}
                >
                    GetSchoolInfo
                </div>
            ),
            { ...size }
        );
    }

    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 60,
                    background: 'white',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '20px solid #eff6ff', // blue-50
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 40px' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={school.image} alt={school.name} style={{ width: 150, height: 150, borderRadius: 20, marginBottom: 20, objectFit: 'cover' }} />
                    <div style={{ fontSize: 64, fontWeight: 'bold', color: '#1e293b', marginBottom: 10, lineHeight: 1.1 }}>
                        {school.name.length > 50 ? school.name.substring(0, 50) + '...' : school.name}
                    </div>
                    <div style={{ fontSize: 32, color: '#64748b', marginBottom: 30 }}>
                        {school.district} • {school.boardSecName}
                    </div>

                    <div style={{ display: 'flex', gap: 40 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ fontSize: 48, fontWeight: 'bold', color: '#2563eb' }}>{school.rowTotal}</div>
                            <div style={{ fontSize: 24, color: '#94a3b8' }}>Students</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ fontSize: 48, fontWeight: 'bold', color: '#2563eb' }}>{school.estdYear}</div>
                            <div style={{ fontSize: 24, color: '#94a3b8' }}>Established</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ fontSize: 48, fontWeight: 'bold', color: '#2563eb' }}>{school.schTypeDesc}</div>
                            <div style={{ fontSize: 24, color: '#94a3b8' }}>Type</div>
                        </div>
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
