'use client';

import React, {
    useRef,
    useEffect,
    useState,
    forwardRef,
    useImperativeHandle,
} from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

function InnerAvatarModel(_, forwardedRef) {
    const { scene } = useGLTF('/models/robot.glb');
    const avatarRef = useRef<THREE.Group>(null);
    const { camera } = useThree();

    const [position, setPosition] = useState(() => new THREE.Vector3(0, 0, 0));
    const keysPressed = useRef<Set<string>>(new Set());

    const interactiveZones = [
        { id: 'projects', position: new THREE.Vector3(5, 0.1, 0) },
        { id: 'resume', position: new THREE.Vector3(-5, 0.1, 0) },
        { id: 'contact', position: new THREE.Vector3(0, 0.1, 5) },
    ];

    useImperativeHandle(forwardedRef, () => avatarRef.current!);

    useEffect(() => {
        const down = (e: KeyboardEvent) => keysPressed.current.add(e.key.toLowerCase());
        const up = (e: KeyboardEvent) => keysPressed.current.delete(e.key.toLowerCase());
        window.addEventListener('keydown', down);
        window.addEventListener('keyup', up);
        return () => {
            window.removeEventListener('keydown', down);
            window.removeEventListener('keyup', up);
        };
    }, []);

    useFrame(() => {
        if (!avatarRef.current) return;

        // Get camera direction for relative movement
        const camDir = new THREE.Vector3();
        camera.getWorldDirection(camDir);
        camDir.y = 0;
        camDir.normalize();

        const camRight = new THREE.Vector3()
            .crossVectors(camDir, new THREE.Vector3(0, 1, 0))
            .normalize();

        let moveDir = new THREE.Vector3();

        if (keysPressed.current.has('w')) moveDir.add(camDir);
        if (keysPressed.current.has('s')) moveDir.sub(camDir);
        if (keysPressed.current.has('a')) moveDir.sub(camRight);
        if (keysPressed.current.has('d')) moveDir.add(camRight);
        if (keysPressed.current.has('q')) moveDir.y += 1;
        if (keysPressed.current.has('e')) moveDir.y -= 1;


        if (moveDir.length() > 0) {
            moveDir.normalize().multiplyScalar(0.1);
            const nextPos = position.clone().add(moveDir);

            const blocked = interactiveZones.some(zone => {
                const d = nextPos.distanceTo(zone.position);
                return d < 2.0; // tune collision radius as needed
            });

            if (!blocked) {
                setPosition(nextPos);
                const targetLook = avatarRef.current.position.clone().add(moveDir);
                avatarRef.current.lookAt(targetLook);
            }
        }

        // Detect proximity to interactive zones
        for (const zone of interactiveZones) {
            const distance = avatarRef.current.position.distanceTo(zone.position);
            if (distance < 1.5) {
                console.log(`Entered zone: ${zone.id}`);
            }
        }

        avatarRef.current.position.lerp(position, 0.2);
    });

    return (
        <primitive
            object={scene}
            ref={avatarRef}
            scale={0.5}
            position={[0, 0.5, 0]}
        />
    );
}

const AvatarModel = forwardRef(InnerAvatarModel);
export default AvatarModel;
