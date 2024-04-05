'use client';

import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Float, Environment } from '@react-three/drei';
import { Suspense, useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';

import { keyMap } from '../../utils/keymap';
import styles from './Shapes.module.scss';

export default function Shapes() {
  return (
    <div className={styles.container}>
      <Canvas
        className="" // z-0
        shadows
        gl={{ antialias: false }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 25], fov: 30, near: 1, far: 40 }}
      >
        <Suspense fallback={null}>
          <Geometries />
          <ContactShadows
            position={[0, -3.5, 0]}
            opacity={0.65}
            scale={40}
            blur={1}
            far={9}
          />
          <Environment preset="studio" />
        </Suspense>
      </Canvas>
    </div>
  );
}

function Geometries() {
  const geometries = [
    {
      position: [0, 0, 0],
      rate: 0.3,
      geometry: new THREE.IcosahedronGeometry(3),
    },
  ];

  const materials = [new THREE.MeshNormalMaterial()];

  return geometries.map(({ position, rate, geometry }) => (
    <Geometry
      key={JSON.stringify(position)}
      position={position.map((p) => p * 2)}
      geometry={geometry}
      materials={materials}
      rate={rate}
    />
  ));
}

function Geometry({ rate, position, geometry, materials }) {
  const meshRef = useRef();
  const [visible, setVisible] = useState(false);
  const startingMaterial = gsap.utils.random(materials);

  const animateMesh = useCallback(
    (thisMesh) => {
      gsap.to(thisMesh.rotation, {
        x: `+=${gsap.utils.random(0, 2)}`,
        y: `+=${gsap.utils.random(0, 2)}`,
        z: `+=${gsap.utils.random(0, 2)}`,
        duration: 1.3,
        ease: 'elastic.out(1, 0.3)',
        yoyo: true,
      });

      thisMesh.material = gsap.utils.random(materials);
    },
    [materials]
  );

  function handleClick(e) {
    const clickedMesh = e.object;
    animateMesh(clickedMesh);
  }

  const handlePointerOver = () => {
    document.body.style.cursor = 'pointer';
  };
  const handlePointerOut = () => {
    document.body.style.cursor = 'default';
  };

  useEffect(() => {
    function handleKeyDown(e) {
      const key = e.code;
      const note = keyMap[key];
      if (note) {
        // e.preventDefault();
        animateMesh(meshRef.current);
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [animateMesh]);

  useEffect(() => {
    let context = gsap.context(() => {
      setVisible(true);
      gsap.from(meshRef.current.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1,
        ease: 'elastic.out(1,0.3)',
        delay: 1.3,
      });
    });
    return () => context.revert(); // clean-up
  }, []);

  return (
    <group position={position} ref={meshRef}>
      <Float
        speed={5 * rate}
        rotationIntensity={6 * rate}
        floatIntensity={5 * rate}
      >
        <mesh
          geometry={geometry}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          visible={visible}
          material={startingMaterial}
        />
      </Float>
    </group>
  );
}
