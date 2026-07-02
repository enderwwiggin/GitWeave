import { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { fileVersions, projects, gitNodes, getProjectColor } from '@/data/mockData';
import { GitBranch, FolderKanban, Filter } from 'lucide-react';
import type { FileVersion } from '@/types';

interface TooltipData {
  x: number;
  y: number;
  version: FileVersion;
}

export default function GitGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [filterProject, setFilterProject] = useState<string | null>(null);
  const linesGroupRef = useRef<THREE.Group | null>(null);

  const filteredVersions = useMemo(() => {
    return filterProject
      ? fileVersions.filter((v) => v.projectId === filterProject)
      : fileVersions;
  }, [filterProject]);

  // Three.js 3D background
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 1, 1000);
    camera.position.z = 200;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const linesGroup = new THREE.Group();
    scene.add(linesGroup);
    linesGroupRef.current = linesGroup;

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x1868d6, transparent: true, opacity: 0.35 });
    const circleGeometry = new THREE.CircleGeometry(4, 32);
    const linesCache = new Map<string, THREE.Line>();

    function updateLines() {
      linesCache.forEach((l) => linesGroup.remove(l));
      linesCache.clear();

      const w = container!.clientWidth;
      const h = container!.clientHeight;

      for (let i = 0; i < gitNodes.length; i++) {
        for (let j = i + 1; j < gitNodes.length; j++) {
          if (Math.random() > 0.6) continue;
          const start = new THREE.Vector3(gitNodes[i].x - w / 2, h / 2 - gitNodes[i].y, 0);
          const end = new THREE.Vector3(gitNodes[j].x - w / 2, h / 2 - gitNodes[j].y, 0);
          const mid = new THREE.Vector3().lerpVectors(start, end, 0.5).add(new THREE.Vector3(0, 0, Math.random() * 100 - 50));
          const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
          const lineGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(20));
          const line = new THREE.Line(lineGeo, lineMaterial);
          linesGroup.add(line);
          linesCache.set(`${i}-${j}`, line);
        }
      }

      const w2 = container!.clientWidth;
      const h2 = container!.clientHeight;
      const spanCandidates: { x: number; y: number; z: number }[] = [];
      for (let y = 0; y < h2; y += 12) {
        for (let x = 0; x < w2; x += 12) {
          let nearLine = false;
          for (let i = 0; i < gitNodes.length && !nearLine; i++) {
            for (let j = i + 1; j < gitNodes.length && !nearLine; j++) {
              const dx = gitNodes[j].x - gitNodes[i].x;
              const dy = gitNodes[j].y - gitNodes[i].y;
              const dist = Math.abs(dy * x - dx * y + gitNodes[j].x * gitNodes[i].y - gitNodes[j].y * gitNodes[i].x) / Math.sqrt(dx * dx + dy * dy);
              if (dist < 6) nearLine = true;
            }
          }
          if (nearLine || Math.random() > 0.97) {
            spanCandidates.push({ x: x - w2 / 2, y: h2 / 2 - y, z: 0 });
          }
        }
      }
      for (let i = spanCandidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [spanCandidates[i], spanCandidates[j]] = [spanCandidates[j], spanCandidates[i]];
      }
      const spans = spanCandidates.slice(0, 150);

      const dotGeo = new THREE.CircleGeometry(1.5, 16);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 });
      spans.forEach((s) => {
        const dot = new THREE.Mesh(dotGeo, dotMat);
        dot.position.set(s.x, s.y, s.z);
        linesGroup.add(dot);
      });

      gitNodes.forEach((n) => {
        const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
        const mesh = new THREE.Mesh(circleGeometry, mat);
        mesh.position.set(n.x - w / 2, h / 2 - n.y, 0);
        scene.add(mesh);
      });
    }

    updateLines();

    let animId: number;
    function animate() {
      animId = requestAnimationFrame(animate);
      linesGroup.rotation.z += 0.00015;
      renderer.render(scene, camera);
    }
    animate();

    function onResize() {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    function onScroll() {
      const scrollY = window.scrollY;
      if (linesGroupRef.current) {
        const velocity = scrollY * 0.001;
        linesGroupRef.current.children.forEach((child) => {
          if (child instanceof THREE.Line || child instanceof THREE.Mesh) {
            child.position.y -= velocity * 0.1;
          }
        });
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div ref={containerRef} className="relative h-full overflow-hidden">
      <div ref={canvasContainerRef} className="absolute inset-0 opacity-40" style={{ zIndex: 0 }} />
      <div className="relative z-10 h-full overflow-y-auto scrollbar-thin p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-mono text-[#969699] tracking-wider uppercase">代码版本</h3>
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#969699]" />
            <button onClick={() => setFilterProject(null)}
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono transition-colors ${!filterProject ? 'bg-[#1868d6]/20 text-[#1868d6]' : 'bg-[#1f1f22] text-[#969699]'}`}>全部</button>
            {projects.map((p) => (
              <button key={p.id} onClick={() => setFilterProject(filterProject === p.id ? null : p.id)}
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono transition-colors ${filterProject === p.id ? '' : 'bg-[#1f1f22] text-[#969699]'}`}
                style={filterProject === p.id ? { backgroundColor: getProjectColor(p.id) + '30', color: getProjectColor(p.id) } : {}}>{p.name}</button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredVersions.map((version, index) => {
            const projColor = getProjectColor(version.projectId);
            const proj = projects.find((p) => p.id === version.projectId);
            return (
              <div key={version.id} className="commit-node glass-panel rounded-lg p-3 cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
                onMouseEnter={(e) => setTooltip({ x: e.clientX, y: e.clientY, version })}
                onMouseLeave={() => setTooltip(null)}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: version.uploader.color }}>
                    <span className="text-xs font-bold text-white">{version.uploader.initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: projColor + '20', color: projColor }}>
                        <FolderKanban className="w-3 h-3" />{proj?.name}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#1868d6] bg-[#1868d6]/10 px-1.5 py-0.5 rounded">{version.version}</span>
                    </div>
                    <p className="text-sm text-[#f4f4f5] truncate">{version.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-xs text-[#969699]">{version.hash}</span>
                      <span className="text-xs text-[#969699]">•</span>
                      <span className="text-xs text-[#969699]">{version.timestamp}</span>
                      <span className="text-xs text-[#969699]">•</span>
                      <span className="text-xs font-mono text-[#969699]">{version.size}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="inline-flex items-center gap-1 text-xs font-mono text-[#969699] bg-[#1f1f22] px-1.5 py-0.5 rounded">
                        <GitBranch className="w-3 h-3" />{version.filename}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-mono text-[#969699] mb-4 tracking-wider uppercase">Branch Graph</h3>
          <div className="relative h-64">
            <svg className="w-full h-full" viewBox="0 0 350 280">
              <line x1="50" y1="20" x2="50" y2="260" stroke="#d7244b" strokeWidth="2" className="branch-line" opacity="0.6" />
              <line x1="150" y1="60" x2="150" y2="260" stroke="#1868d6" strokeWidth="2" className="branch-line" opacity="0.6" />
              <line x1="250" y1="100" x2="250" y2="260" stroke="#10b981" strokeWidth="2" className="branch-line" opacity="0.6" />
              <path d="M 50 80 Q 100 80 150 100" fill="none" stroke="#1868d6" strokeWidth="2" opacity="0.5" />
              <path d="M 150 160 Q 200 160 250 180" fill="none" stroke="#10b981" strokeWidth="2" opacity="0.5" />
              <path d="M 50 200 Q 100 200 150 220" fill="none" stroke="#1868d6" strokeWidth="2" opacity="0.5" />
              {[
                { cx: 50, cy: 20, type: 'commit', label: 'main' },
                { cx: 50, cy: 80, type: 'commit', label: 'a3f7d2e' },
                { cx: 150, cy: 60, type: 'branch', label: 'feat/umi' },
                { cx: 150, cy: 100, type: 'commit', label: 'b8e1c5a' },
                { cx: 250, cy: 100, type: 'branch', label: 'feat/semg' },
                { cx: 50, cy: 140, type: 'commit', label: 'c9d4f1b' },
                { cx: 150, cy: 160, type: 'commit', label: 'd2a7e8c' },
                { cx: 250, cy: 180, type: 'merge', label: 'merge' },
                { cx: 50, cy: 200, type: 'commit', label: 'e5b3c9d' },
                { cx: 150, cy: 220, type: 'commit', label: 'f1c8a4e' },
                { cx: 50, cy: 260, type: 'commit', label: 'HEAD' },
              ].map((node, i) => (
                <g key={i}>
                  <circle cx={node.cx} cy={node.cy} r={node.type === 'merge' ? 8 : 6}
                    fill={node.type === 'merge' ? '#1868d6' : node.type === 'branch' ? '#d7244b' : '#10b981'}
                    stroke="#050507" strokeWidth="2" className="pulse-dot" style={{ animationDelay: `${i * 200}ms` }} />
                  <text x={node.cx + 14} y={node.cy + 4} fill="#969699" fontSize="10" fontFamily="JetBrains Mono, monospace">{node.label}</text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>

      {tooltip && (
        <div className="fixed z-50 glass-panel rounded-lg p-3 max-w-xs pointer-events-none" style={{ left: tooltip.x + 16, top: tooltip.y - 16 }}>
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getProjectColor(tooltip.version.projectId) }} />
            <span className="text-[10px] text-[#969699]">{projects.find((p) => p.id === tooltip.version.projectId)?.name}</span>
          </div>
          <p className="text-sm font-mono text-[#1868d6] mb-1">{tooltip.version.version}: {tooltip.version.hash}</p>
          <p className="text-xs text-[#f4f4f5] mb-2">{tooltip.version.description}</p>
          <div className="flex items-center gap-2 text-xs text-[#969699]">
            <span>{tooltip.version.filename}</span>
            <span>{tooltip.version.size}</span>
          </div>
        </div>
      )}
    </div>
  );
}
