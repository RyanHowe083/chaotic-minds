'use client';

import { useFrame, useThree } from '@react-three/fiber';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function BulletManager({
                                          targetRef,
                                          useCameraDirection = false,
                                      }: {
    targetRef: React.RefObject<THREE.Group | null>;
    useCameraDirection?: boolean;
}) {
    const bullets = useRef<THREE.Mesh[]>([]);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const firing = useRef(false);
    const fireCooldown = useRef(0);
    const { camera } = useThree();

    useEffect(() => {
        const down = () => (firing.current = true);
        const up = () => (firing.current = false);

        window.addEventListener('mousedown', down);
        window.addEventListener('mouseup', up);
        return () => {
            window.removeEventListener('mousedown', down);
            window.removeEventListener('mouseup', up);
        };
    }, []);

    useFrame(({ scene }, delta) => {
        if (!sceneRef.current) sceneRef.current = scene;

        // Cooldown control
        if (fireCooldown.current > 0) {
            fireCooldown.current -= delta;
        }

        // Fire bullet if active
        if (firing.current && fireCooldown.current <= 0) {
            const originObj = useCameraDirection ? camera : targetRef.current;
            if (!originObj) return;

            const bullet = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 8, 8),
                new THREE.MeshBasicMaterial({ color: '#ffff33' })
            );

            const direction = new THREE.Vector3();
            originObj.getWorldDirection(direction).normalize();

            const start = originObj.position.clone().add(new THREE.Vector3(0, 1, 0));
            const offsetStart = start.clone().add(direction.clone().multiplyScalar(0.6));

            bullet.position.copy(offsetStart);
            (bullet as any).velocity = direction.clone().multiplyScalar(30);

            scene.add(bullet);
            bullets.current.push(bullet);

            fireCooldown.current = 0.15; // fire rate (seconds)
        }

        // Move and clean up bullets
        bullets.current.forEach((b) => {
            b.position.add((b as any).velocity.clone().multiplyScalar(delta));
        });

        bullets.current = bullets.current.filter((b) => {
            if (b.position.length() > 200) {
                scene.remove(b);
                return false;
            }
            return true;
        });
    });

    return null;
}
