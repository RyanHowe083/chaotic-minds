'use client';

import { Application } from '@pixi/react';
import * as PIXI from 'pixi.js';

// This is the draw function you'll pass into the graphics element
const draw = (g: PIXI.Graphics) => {
    g.clear();
    g.rect(100, 100, 50, 50).fill({ color: 0x5da3fa });
};

export default function PixiApp() {
    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <Application
                background={0x1d1d1d}
                width={window.innerWidth}
                height={window.innerHeight}
                autoDensity
                resolution={window.devicePixelRatio}
            >
                {/* 👇 This is where you use it */}
                <graphics draw={draw} />
            </Application>
        </div>
    );
}
