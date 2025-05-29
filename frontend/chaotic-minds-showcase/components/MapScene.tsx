// app/MapScene.tsx
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import AvatarModel from '../components/AvatarModel';
import BulletManager from '../components/BulletManager';
import CompassOverlay from '../components/CompassOverlay';
import * as THREE from 'three';

function CameraFollow({ targetRef }: { targetRef: React.RefObject<THREE.Object3D | null> }) {

    const { camera, gl } = useThree();
    const [yaw, setYaw] = useState(0);
    const [pitch, setPitch] = useState(0);
    const pointerLocked = useRef(false);
    const keys = useRef(new Set<string>());

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => keys.current.add(e.key.toLowerCase());
        const onKeyUp = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
        };
    }, []);

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (!pointerLocked.current) return;
            setYaw((a) => a - e.movementX * 0.002);
            setPitch((p) => {
                const newPitch = p + e.movementY * 0.002;
                return Math.max(-Math.PI / 3, Math.min(Math.PI / 3, newPitch));
            });
        };

        const onClick = () => {
            if (!pointerLocked.current) {
                gl.domElement.requestPointerLock();
            }
        };

        const onLockChange = () => {
            pointerLocked.current = document.pointerLockElement === gl.domElement;
        };

        gl.domElement.addEventListener('click', onClick);
        document.addEventListener('pointerlockchange', onLockChange);
        document.addEventListener('mousemove', onMouseMove);

        return () => {
            gl.domElement.removeEventListener('click', onClick);
            document.removeEventListener('pointerlockchange', onLockChange);
            document.removeEventListener('mousemove', onMouseMove);
        };
    }, [gl.domElement]);

    useFrame(() => {
        if (!targetRef.current) return;

        if (keys.current.has('arrowleft')) setYaw((a) => a - 0.03);
        if (keys.current.has('arrowright')) setYaw((a) => a + 0.03);

        const targetPos = targetRef.current.position.clone();
        const radius = 4;

        const offset = new THREE.Vector3(
            radius * Math.sin(yaw) * Math.cos(pitch),
            radius * Math.sin(pitch) + 2,
            radius * Math.cos(yaw) * Math.cos(pitch)
        );

        const desiredPos = targetPos.clone().add(offset);
        camera.position.lerp(desiredPos, 0.1);
        camera.lookAt(targetPos);

        // update avatar rotation to face forward
        targetRef.current.rotation.y = yaw;
    });

    return null;
}

function Crosshair() {
    return (
        <div
            style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 10,
                height: 10,
                backgroundColor: 'white',
                borderRadius: '50%',
                pointerEvents: 'none',
                zIndex: 10,
            }}
        />
    );
}

export default function MapScene() {
    const avatarRef = useRef<THREE.Group>(null);
    const [direction, setDirection] = useState('N');

    useEffect(() => {
        const updateDirection = () => {
            if (!avatarRef.current) return;
            const cameraDir = new THREE.Vector3();
            avatarRef.current.getWorldDirection(cameraDir);
            const angle = Math.atan2(cameraDir.x, cameraDir.z);
            const degrees = (angle * 180) / Math.PI;
            const compassIndex = Math.round(degrees / 45) % 8;
            const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
            const adjusted = (compassIndex + 8) % 8;
            setDirection(directions[adjusted]);
        };
        const interval = setInterval(updateDirection, 100);
        return () => clearInterval(interval);
    }, []);

    const interactiveObjects = [
        { id: 'projects', position: [5, 0.1, 0] },
        { id: 'resume', position: [-5, 0.1, 0] },
        { id: 'contact', position: [0, 0.1, 5] },
    ];

    return (
        <>
            <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
                <Canvas
                    shadows
                    camera={{ position: [0, 5, 10], fov: 50 }}
                    style={{ width: '100%', height: '100%' }}
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
                    <BulletManager targetRef={avatarRef} useCameraDirection />
                    <CameraFollow targetRef={avatarRef} />
                    <Environment preset="sunset" />
                </Canvas>

                <Crosshair />
                <CompassOverlay direction={direction} />
            </div>
        </>
    );
}