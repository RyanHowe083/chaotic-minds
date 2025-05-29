// app/MapScene.tsx
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import AvatarModel from '../components/AvatarModel';
import * as THREE from 'three';

function CameraFollow({ targetRef }: { targetRef: React.RefObject<THREE.Object3D> }) {
    const { camera } = useThree();
    const [angle, setAngle] = useState(0);
    const keysPressed = useRef<Set<string>>(new Set());

    useEffect(() => {
        const handleDown = (e: KeyboardEvent) => keysPressed.current.add(e.key);
        const handleUp = (e: KeyboardEvent) => keysPressed.current.delete(e.key);
        window.addEventListener('keydown', handleDown);
        window.addEventListener('keyup', handleUp);
        return () => {
            window.removeEventListener('keydown', handleDown);
            window.removeEventListener('keyup', handleUp);
        };
    }, []);

    useFrame(() => {
        if (!targetRef.current) return;

        if (keysPressed.current.has('ArrowLeft')) setAngle((a) => a + 0.02);
        if (keysPressed.current.has('ArrowRight')) setAngle((a) => a - 0.02);

        const targetPos = targetRef.current.position.clone();
        const radius = 8;
        const height = 4;
        const camX = targetPos.x + radius * Math.sin(angle);
        const camZ = targetPos.z + radius * Math.cos(angle);
        const camY = targetPos.y + height;

        camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.1);
        camera.lookAt(targetPos);
    });

    return null;
}

export default function MapScene() {
    const avatarRef = useRef<THREE.Group>(null);

    const interactiveObjects = [
        { id: 'projects', position: [5, 0.1, 0] },
        { id: 'resume', position: [-5, 0.1, 0] },
        { id: 'contact', position: [0, 0.1, 5] },
    ];

    return (
        <Canvas
            shadows
            camera={{ position: [0, 5, 10], fov: 50 }}
            fog={new THREE.Fog('#000', 15, 60)}
        >
            <color attach="background" args={['#050505']} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                <planeGeometry args={[200, 200]} />
                <meshStandardMaterial color="#111" />
            </mesh>

            {interactiveObjects.map(({ id, position }) => (
                <mesh key={id} position={position as [number, number, number]} castShadow receiveShadow>
                    <boxGeometry args={[3, 0.3, 3]} />
                    <meshStandardMaterial color="#222" />
                </mesh>
            ))}

            {[ [0, 1.5, -10], [8, 1.5, 8], [-8, 1.5, -8] ].map((pos, i) => (
                <mesh key={`pillar-${i}`} position={pos as [number, number, number]} castShadow>
                    <boxGeometry args={[1, 3, 1]} />
                    <meshStandardMaterial
                        color="#44f"
                        emissive="#22aaff"
                        emissiveIntensity={0.8}
                        metalness={0.6}
                    />
                </mesh>
            ))}

            <AvatarModel ref={avatarRef} />
            <CameraFollow targetRef={avatarRef} />
            <Environment preset="sunset" />
        </Canvas>
    );
}