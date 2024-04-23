'use client';

import { PerspectiveCamera } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useRef } from 'react';
import { Mesh, Vector3 } from 'three';

import { keyMap } from '../../utils/keymap';
import styles from './KeyboardGUI.module.scss';

function Cube(props: { position: Vector3 }) {
  const meshRef = useRef<Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) {
      return;
    }
    meshRef.current.rotation.x += 0.01;
    meshRef.current.rotation.y += 0.01;
  });

  return (
    <mesh position={props.position} ref={meshRef}>
      {/* <PerspectiveCamera /> */}
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
}

export default function KeyboardGUI() {
  return (
    <Canvas camera={{ position: [0, 5, 20] }}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      {Object.values(keyMap).map(function (keyCode, index) {
        const offsetX = index / 4 - 2;
        const offsetY = Math.floor(index % 4) * 2;
        const position: Vector3 = new Vector3(-4 + offsetX, 4 - offsetY, 12);
        return <Cube key={keyCode} position={position} />;
      })}
    </Canvas>
  );
}
