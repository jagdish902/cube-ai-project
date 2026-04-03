"use client";
import React, { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const COLORS = {
  right: "#0051ba", left: "#ff5800", top: "#ffffff",
  bottom: "#ffd500", front: "#009e60", back: "#c41e3a",
  plastic: "#121212"
};

function Cubie({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Black Plastic Body */}
      <RoundedBox args={[0.94, 0.94, 0.94]} radius={0.05} smoothness={4}>
        <meshStandardMaterial color={COLORS.plastic} roughness={0.1} />
      </RoundedBox>
      {/* Colored Stickers */}
      <mesh>
        <boxGeometry args={[0.96, 0.96, 0.96]} />
        <meshStandardMaterial attach="material-0" color={COLORS.right} />
        <meshStandardMaterial attach="material-1" color={COLORS.left} />
        <meshStandardMaterial attach="material-2" color={COLORS.top} />
        <meshStandardMaterial attach="material-3" color={COLORS.bottom} />
        <meshStandardMaterial attach="material-4" color={COLORS.front} />
        <meshStandardMaterial attach="material-5" color={COLORS.back} />
      </mesh>
    </group>
  );
}

function RubiksSystem() {
  const groupRef = useRef<THREE.Group>(null);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const handleMove = (e: any) => {
      if (animating || !groupRef.current) return;
      const move = e.detail;
      const pivot = new THREE.Group();
      groupRef.current.add(pivot);

      const toRotate: THREE.Object3D[] = [];
      groupRef.current.children.forEach((child) => {
        if (child === pivot) return;
        const pos = new THREE.Vector3();
        child.getWorldPosition(pos);
        
        // Selection Logic for 3x3 Layers
        if (move === "R" && pos.x > 0.5) toRotate.push(child);
        if (move === "L" && pos.x < -0.5) toRotate.push(child);
        if (move === "U" && pos.y > 0.5) toRotate.push(child);
        if (move === "D" && pos.y < -0.5) toRotate.push(child);
        if (move === "F" && pos.z > 0.5) toRotate.push(child);
        if (move === "B" && pos.z < -0.5) toRotate.push(child);
      });

      if (toRotate.length === 0) { groupRef.current.remove(pivot); return; }
      toRotate.forEach(obj => pivot.add(obj));
      setAnimating(true);

      const axis = (move === "R" || move === "L") ? "x" : (move === "U" || move === "D" ? "y" : "z");
      const angle = (move === "L" || move === "D" || move === "B") ? Math.PI / 2 : -Math.PI / 2;

      let progress = 0;
      const animate = () => {
        progress += 0.2; // Fast rotation speed
        if (progress < 1) {
          pivot.rotation[axis] = angle * progress;
          requestAnimationFrame(animate);
        } else {
          pivot.rotation[axis] = angle;
          pivot.updateMatrixWorld();
          toRotate.forEach(obj => {
            obj.applyMatrix4(pivot.matrixWorld);
            groupRef.current?.add(obj);
          });
          groupRef.current?.remove(pivot);
          setAnimating(false);
        }
      };
      animate();
    };

    window.addEventListener("cube-move", handleMove);
    return () => window.removeEventListener("cube-move", handleMove);
  }, [animating]);

  const cubies = [];
  for (let x = -1; x <= 1; x++) 
    for (let y = -1; y <= 1; y++) 
      for (let z = -1; z <= 1; z++) 
        cubies.push(<Cubie key={`${x}${y}${z}`} position={[x, y, z]} />);

  return <group ref={groupRef}>{cubies}</group>;
}

export default function Cube() {
  return (
    <Canvas camera={{ position: [4.5, 4.5, 4.5], fov: 40 }}>
      <ambientLight intensity={1.2} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <RubiksSystem />
      <OrbitControls enableZoom={false} makeDefault />
    </Canvas>
  );
}