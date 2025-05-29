// components/CompassOverlay.tsx
'use client';

import React from 'react';

export default function CompassOverlay({ direction }: { direction: string }) {
    return (
        <div
            style={{
                position: 'absolute',
                top: 20,
                right: 20,
                color: 'white',
                fontSize: 24,
                fontFamily: 'monospace',
                background: 'rgba(0,0,0,0.6)',
                padding: '4px 10px',
                borderRadius: '6px',
            }}
        >
            {direction}
        </div>
    );
}
