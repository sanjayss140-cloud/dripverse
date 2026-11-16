import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, ZoomIn, ZoomOut, Maximize2, Sun } from 'lucide-react';

interface ThreeDViewerProps {
  modelType: string;
  upperwearColor?: string;
  bottomwearColor?: string;
  outerwearColor?: string;
  footwearColor?: string;
  skinTone?: string;
  bodyProportions?: string;
  theme?: 'light' | 'dark';
}

export const ThreeDViewer: React.FC<ThreeDViewerProps> = ({
  modelType,
  upperwearColor = '#18181b',
  bottomwearColor = '#1e3a8a',
  outerwearColor,
  footwearColor = '#f4f4f5',
  skinTone = '#d8b29c',
  bodyProportions = 'regular',
  theme = 'light',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const figureGroupRef = useRef<THREE.Group | null>(null);

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

    // Studio Lights adapted to Light / Dark mode
    const isDark = theme === 'dark';
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.8 : 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, isDark ? 1.4 : 1.6);
    keyLight.position.set(3, 4, 3);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xf5f3ff, isDark ? 0.6 : 0.9);
    fillLight.position.set(-3, 2, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x7547d9, isDark ? 0.8 : 0.4);
    rimLight.position.set(-2, 3, -3);
    scene.add(rimLight);

    // Floor Pedestal
    const pedestalGeo = new THREE.CylinderGeometry(1.2, 1.3, 0.08, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x14141c : 0xf2f2f7,
      roughness: 0.3,
      metalness: isDark ? 0.6 : 0.2,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -1.1;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Floor contact shadow disc
    const shadowGeo = new THREE.RingGeometry(0.1, 1.35, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x050508 : 0xdddddf,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: isDark ? 0.6 : 0.3,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = Math.PI / 2;
    shadowMesh.position.y = -1.09;
    scene.add(shadowMesh);

    // Figure Group
    const figureGroup = new THREE.Group();
    figureGroupRef.current = figureGroup;
    scene.add(figureGroup);

    // Build Sartorial 3D Model Body
    const isFemale = modelType.includes('female');
    const isMannequin = modelType.includes('mannequin');

    const effectiveSkin = isMannequin
      ? (isFemale ? '#dcd6cb' : '#32343c')
      : skinTone;

    const skinMat = new THREE.MeshStandardMaterial({
      color: effectiveSkin,
      roughness: isMannequin ? 0.8 : 0.4,
      metalness: 0.05,
    });

    const upperMat = new THREE.MeshStandardMaterial({
      color: upperwearColor,
      roughness: 0.65,
    });

    const bottomMat = new THREE.MeshStandardMaterial({
      color: bottomwearColor,
      roughness: 0.7,
    });

    const shoeMat = new THREE.MeshStandardMaterial({
      color: footwearColor,
      roughness: 0.3,
    });

    // Proportions scaling factor
    const widthScale = bodyProportions === 'athletic' ? 1.15 : bodyProportions === 'slim' ? 0.9 : 1.0;
    const heightScale = bodyProportions === 'tall' ? 1.08 : 1.0;

    // Torso / Upperwear
    const torsoGeo = new THREE.CylinderGeometry(
      (isFemale ? 0.26 : 0.32) * widthScale,
      (isFemale ? 0.22 : 0.28) * widthScale,
      0.65 * heightScale,
      32
    );
    const torsoMesh = new THREE.Mesh(torsoGeo, upperMat);
    torsoMesh.position.y = 0.85 * heightScale;
    torsoMesh.castShadow = true;
    figureGroup.add(torsoMesh);

    // Outerwear layer if present
    if (outerwearColor) {
      const outerMat = new THREE.MeshStandardMaterial({
        color: outerwearColor,
        roughness: 0.5,
      });
      const outerGeo = new THREE.CylinderGeometry(
        (isFemale ? 0.28 : 0.35) * widthScale,
        (isFemale ? 0.25 : 0.31) * widthScale,
        0.68 * heightScale,
        32
      );
      const outerMesh = new THREE.Mesh(outerGeo, outerMat);
      outerMesh.position.y = 0.85 * heightScale;
      outerMesh.castShadow = true;
      figureGroup.add(outerMesh);
    }

    // Head / Mannequin Top
    if (isMannequin) {
      // Atelier Dummy Neck Cap
      const finialGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.16, 16);
      const finialMat = new THREE.MeshStandardMaterial({
        color: isFemale ? 0x8c6242 : 0x222226,
        roughness: 0.4,
      });
      const finial = new THREE.Mesh(finialGeo, finialMat);
      finial.position.y = 1.3 * heightScale;
      figureGroup.add(finial);

      // Egg Head
      const eggGeo = new THREE.SphereGeometry(0.18, 24, 24);
      const eggMesh = new THREE.Mesh(eggGeo, skinMat);
      eggMesh.scale.set(0.9, 1.2, 0.9);
      eggMesh.position.y = 1.48 * heightScale;
      figureGroup.add(eggMesh);
    } else {
      // Natural Neck & Head
      const neckGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.18, 16);
      const neckMesh = new THREE.Mesh(neckGeo, skinMat);
      neckMesh.position.y = 1.25 * heightScale;
      figureGroup.add(neckMesh);

      const headGeo = new THREE.SphereGeometry(0.19, 32, 32);
      const headMesh = new THREE.Mesh(headGeo, skinMat);
      headMesh.scale.set(0.92, 1.15, 0.95);
      headMesh.position.y = 1.44 * heightScale;
      headMesh.castShadow = true;
      figureGroup.add(headMesh);
    }

    // Legs / Bottomwear
    const legRadius = (isFemale ? 0.09 : 0.11) * widthScale;
    const legHeight = 0.95 * heightScale;

    // Left Leg
    const leftLegGeo = new THREE.CylinderGeometry(legRadius, legRadius * 0.8, legHeight, 24);
    const leftLeg = new THREE.Mesh(leftLegGeo, bottomMat);
    leftLeg.position.set(-0.16 * widthScale, 0.05, 0);
    leftLeg.castShadow = true;
    figureGroup.add(leftLeg);

    // Right Leg
    const rightLegGeo = new THREE.CylinderGeometry(legRadius, legRadius * 0.8, legHeight, 24);
    const rightLeg = new THREE.Mesh(rightLegGeo, bottomMat);
    rightLeg.position.set(0.16 * widthScale, 0.05, 0);
    rightLeg.castShadow = true;
    figureGroup.add(rightLeg);

    // Footwear / Shoes
    const shoeGeo = new THREE.BoxGeometry(0.14 * widthScale, 0.1, 0.3);
    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(-0.16 * widthScale, -0.48, 0.05);
    leftShoe.castShadow = true;
    figureGroup.add(leftShoe);

    const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoe.position.set(0.16 * widthScale, -0.48, 0.05);
    rightShoe.castShadow = true;
    figureGroup.add(rightShoe);

    // Render loop
    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      if (autoRotate && figureGroupRef.current && !isDraggingRef.current) {
        figureGroupRef.current.rotation.y += 0.008;
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
      figureGroupRef.current.rotation.y += deltaX * 0.01;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      cancelAnimationFrame(reqId);
      domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      renderer.dispose();
    };
  }, [modelType, upperwearColor, bottomwearColor, outerwearColor, footwearColor, skinTone, bodyProportions, theme, autoRotate]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* 3D Floating Control Pill */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-studio-bg/90 backdrop-blur-md border border-studio-border text-xs flex items-center space-x-3 shadow-studio-card">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
            autoRotate
              ? 'bg-studio-accent text-white shadow-studio-sm'
              : 'bg-studio-secondary text-studio-muted hover:text-studio-text'
          }`}
        >
          <RotateCw className="w-3 h-3" />
          <span>{autoRotate ? 'Rotating' : 'Paused'}</span>
        </button>
        <span className="text-[10px] text-studio-muted">Click & drag to orbit</span>
      </div>
    </div>
  );
};
