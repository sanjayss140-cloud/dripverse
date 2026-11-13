import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, ZoomIn, ZoomOut, Maximize2, Sun, ShieldCheck } from 'lucide-react';

interface ThreeDViewerProps {
  modelType: string;
  upperwearColor?: string;
  bottomwearColor?: string;
  outerwearColor?: string;
  footwearColor?: string;
  skinTone?: string;
  bodyProportions?: string;
}

export const ThreeDViewer: React.FC<ThreeDViewerProps> = ({
  modelType,
  upperwearColor = '#18181b',
  bottomwearColor = '#1e3a8a',
  outerwearColor,
  footwearColor = '#f4f4f5',
  skinTone = '#d8b29c',
  bodyProportions = 'regular',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const figureGroupRef = useRef<THREE.Group | null>(null);

  const [lightingPreset, setLightingPreset] = useState<'studio' | 'dramatic' | 'warm'>('studio');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.2, 3.8);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // Studio Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(3, 4, 3);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xa855f7, 0.8);
    rimLight.position.set(-3, 3, -3);
    scene.add(rimLight);

    // Floor Pedestal
    const pedestalGeo = new THREE.CylinderGeometry(1.2, 1.3, 0.08, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x14141c,
      roughness: 0.4,
      metalness: 0.6,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -1.1;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Figure Group
    const figureGroup = new THREE.Group();
    figureGroupRef.current = figureGroup;
    scene.add(figureGroup);

    // Build Sartorial 3D Model Body
    const isFemale = modelType.includes('female');
    const isMannequin = modelType.includes('mannequin');

    const effectiveSkin = isMannequin
      ? (isFemale ? '#c8c2b7' : '#2b2b36')
      : skinTone;

    const skinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(effectiveSkin),
      roughness: isMannequin ? 0.7 : 0.5,
      metalness: isMannequin ? 0.1 : 0.05,
    });

    const upperMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(upperwearColor),
      roughness: 0.7,
      metalness: 0.1,
    });

    const bottomMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(bottomwearColor),
      roughness: 0.8,
      metalness: 0.1,
    });

    const shoeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(footwearColor),
      roughness: 0.4,
      metalness: 0.2,
    });

    // Torso (Upperwear)
    const torsoWidth = isFemale ? 0.36 : 0.42;
    const torsoGeo = new THREE.CylinderGeometry(torsoWidth * 0.9, torsoWidth * 0.8, 0.7, 32);
    const torsoMesh = new THREE.Mesh(torsoGeo, upperMat);
    torsoMesh.position.y = 0.45;
    torsoMesh.castShadow = true;
    figureGroup.add(torsoMesh);

    // Neck & Head
    const neckGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.16, 24);
    const neckMesh = new THREE.Mesh(neckGeo, skinMat);
    neckMesh.position.y = 0.88;
    figureGroup.add(neckMesh);

    const headGeo = new THREE.SphereGeometry(0.18, 32, 32);
    headGeo.scale(1, 1.25, 1);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.position.y = 1.14;
    figureGroup.add(headMesh);

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.75, 24);
    const leftArm = new THREE.Mesh(armGeo, skinMat);
    leftArm.position.set(-torsoWidth * 1.15, 0.38, 0);
    leftArm.rotation.z = 0.08;
    figureGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, skinMat);
    rightArm.position.set(torsoWidth * 1.15, 0.38, 0);
    rightArm.rotation.z = -0.08;
    figureGroup.add(rightArm);

    // Legs (Bottomwear)
    const legGeo = new THREE.CylinderGeometry(0.11, 0.085, 0.95, 24);
    const leftLeg = new THREE.Mesh(legGeo, bottomMat);
    leftLeg.position.set(-0.16, -0.38, 0);
    leftLeg.castShadow = true;
    figureGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, bottomMat);
    rightLeg.position.set(0.16, -0.38, 0);
    rightLeg.castShadow = true;
    figureGroup.add(rightLeg);

    // Shoes
    const shoeGeo = new THREE.BoxGeometry(0.15, 0.12, 0.28);
    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(-0.16, -0.92, 0.04);
    figureGroup.add(leftShoe);

    const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoe.position.set(0.16, -0.92, 0.04);
    figureGroup.add(rightShoe);

    // Optional Outerwear Layer
    if (outerwearColor) {
      const outerMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(outerwearColor),
        roughness: 0.5,
      });
      const outerGeo = new THREE.CylinderGeometry(torsoWidth * 1.05, torsoWidth * 0.95, 0.78, 32);
      const outerMesh = new THREE.Mesh(outerGeo, outerMat);
      outerMesh.position.y = 0.44;
      figureGroup.add(outerMesh);
    }

    // Animation Loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (figureGroupRef.current && autoRotate) {
        figureGroupRef.current.rotation.y += 0.006;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Mouse Interaction for 3D Orbit
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !figureGroupRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      figureGroupRef.current.rotation.y += deltaX * 0.008;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      cameraRef.current.position.z = Math.max(
        2.2,
        Math.min(5.5, cameraRef.current.position.z + e.deltaY * 0.003)
      );
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    domElement.addEventListener('wheel', handleWheel, { passive: false });

    // Handle Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domElement.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [modelType, upperwearColor, bottomwearColor, outerwearColor, footwearColor, skinTone, bodyProportions, autoRotate]);

  // Quick snap camera angles
  const snapToAngle = (angle: 'front' | 'back' | 'left' | 'right') => {
    setAutoRotate(false);
    if (!figureGroupRef.current) return;
    const angles = {
      front: 0,
      back: Math.PI,
      left: Math.PI / 2,
      right: -Math.PI / 2,
    };
    figureGroupRef.current.rotation.y = angles[angle];
  };

  const zoomCamera = (direction: 'in' | 'out') => {
    if (!cameraRef.current) return;
    const delta = direction === 'in' ? -0.4 : 0.4;
    cameraRef.current.position.z = Math.max(2.2, Math.min(5.5, cameraRef.current.position.z + delta));
  };

  return (
    <div className="relative w-full h-full min-h-[480px] bg-gradient-to-b from-[#0e0e14] via-[#12121a] to-[#0a0a0e] rounded-2xl overflow-hidden border border-white/10 select-none">
      {/* 3D Canvas Mount Point */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Angle Presets Bar */}
      <div className="absolute top-4 left-4 flex items-center space-x-1.5 bg-drip-dark/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs">
        <span className="text-zinc-400 mr-1.5 font-medium">Orbit Angle:</span>
        {(['front', 'back', 'left', 'right'] as const).map((angle) => (
          <button
            key={angle}
            onClick={() => snapToAngle(angle)}
            className="px-2.5 py-1 rounded-full uppercase tracking-wider text-[10px] font-semibold bg-zinc-800/80 hover:bg-violet-600 text-white transition-all"
          >
            {angle}
          </button>
        ))}
      </div>

      {/* Controls Overlay */}
      <div className="absolute bottom-4 right-4 flex items-center space-x-2 bg-drip-dark/85 backdrop-blur-md p-2 rounded-xl border border-white/10 shadow-lg text-xs">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-2 rounded-lg transition-all ${
            autoRotate ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
          }`}
          title="Toggle Auto 360 Rotation"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button
          onClick={() => zoomCamera('in')}
          className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => zoomCamera('out')}
          className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Informational Badge */}
      <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-drip-dark/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[11px] text-zinc-400">
        <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
        <span>Three.js Interactive Studio • Drag to Orbit • Scroll to Zoom</span>
      </div>
    </div>
  );
};
