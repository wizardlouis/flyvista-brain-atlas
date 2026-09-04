import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";
import { baseRegion, meshNames, regionDetails, regionDetailsEnglish, systemForRegion, systems, type FunctionalSystem } from "../brain-data";

type ViewName = "front" | "top" | "side";
type Language = "zh" | "en";

const ui = {
  zh: {
    eyebrow: "FLYVISTA · 果蝇脑景", title: "成年果蝇全脑功能分区", neuropils: "神经毡",
    leftLegend: "功能分区图例左列", rightLegend: "功能分区图例右列", canvas: "可拖动旋转的三维果蝇大脑",
    loading: "正在装载全脑分区",
    views: { front: "正面", top: "顶面", side: "侧面" }, viewToolbar: "标准视角",
    orientation: "三维解剖方向：前后、左右、背腹", showSystem: "显示功能分区", hideSystem: "隐藏功能分区",
    gesture: "拖动旋转 · 滚轮缩放 · 点击查看脑区", close: "关闭详情",
    hemispheres: { left: "左半球", right: "右半球", midline: "中线结构" },
    footer: "颜色表示主要功能归属，而非排他的生物学边界；跨系统接口按主要回路位置归类。",
    source: "数据：FlyWire 神经毡体积 · 功能映射：FlyVista 六分区图谱", language: "语言",
  },
  en: {
    eyebrow: "FLYVISTA · DROSOPHILA BRAIN ATLAS", title: "Adult Drosophila Brain Functional Atlas", neuropils: "neuropils",
    leftLegend: "Left functional-system legend", rightLegend: "Right functional-system legend", canvas: "Rotatable 3D adult Drosophila brain",
    loading: "Loading whole-brain regions",
    views: { front: "Front", top: "Top", side: "Side" }, viewToolbar: "Standard views",
    orientation: "3D anatomical orientation: anterior-posterior, left-right and dorsal-ventral", showSystem: "Show functional system", hideSystem: "Hide functional system",
    gesture: "Drag to rotate · Scroll to zoom · Click a region for details", close: "Close details",
    hemispheres: { left: "Left hemisphere", right: "Right hemisphere", midline: "Midline structure" },
    footer: "Colours indicate primary functional affiliation, not exclusive biological boundaries; cross-system interfaces are classified by their principal circuit position.",
    source: "Data: FlyWire neuropil volumes · Functional mapping: FlyVista six-system atlas", language: "Language",
  },
} as const;

function EyeIcon({ visible }: { visible: boolean }) {
  return <span className="eye-icon" aria-hidden="true"><span className="eye-outline" /><span className="eye-pupil" />{!visible && <span className="eye-slash" />}</span>;
}

function LegendCard({ system, language, active, visible, onSelect, onToggleVisibility }: { system: FunctionalSystem; language: Language; active: boolean; visible: boolean; onSelect: () => void; onToggleVisibility: () => void }) {
  const copy = ui[language];
  return (
    <article className={`legend-card ${active ? "is-active" : ""} ${visible ? "is-visible" : "is-hidden"}`} style={{ "--system-color": system.color } as CSSProperties}>
      <span className="legend-swatch" />
      <button className="legend-select" onClick={onSelect} aria-pressed={active} disabled={!visible}>
        <span className="legend-copy">
        <strong>{language === "zh" ? system.name : system.english}</strong>
        <span>{language === "zh" ? system.function : system.englishFunction}</span><em>{system.regions.join(" · ")}</em>
        </span>
      </button>
      <button className="visibility-toggle" onClick={onToggleVisibility} aria-pressed={visible} aria-label={`${visible ? copy.hideSystem : copy.showSystem}：${language === "zh" ? system.name : system.english}`} title={visible ? copy.hideSystem : copy.showSystem}>
        <EyeIcon visible={visible} />
      </button>
    </article>
  );
}

export default function BrainAtlas() {
  const mountRef = useRef<HTMLDivElement>(null);
  const gizmoRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshRef = useRef<THREE.Mesh[]>([]);
  const [loaded, setLoaded] = useState(0);
  const [activeSystem, setActiveSystem] = useState<string | null>(null);
  const [selectedMesh, setSelectedMesh] = useState<string | null>(null);
  const [view, setView] = useState<ViewName>("front");
  const [language, setLanguage] = useState<Language>("zh");
  const [visibleSystems, setVisibleSystems] = useState<Set<string>>(() => new Set(systems.map((system) => system.id)));
  const copy = ui[language];

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  const setCameraView = useCallback((next: ViewName) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    // Anatomical body frame: +X anterior, +Y right, +Z dorsal.
    const presets: Record<ViewName, { position: THREE.Vector3; up: THREE.Vector3 }> = {
      front: { position: new THREE.Vector3(510, 0, 0), up: new THREE.Vector3(0, 0, 1) },
      top: { position: new THREE.Vector3(0, 0, 510), up: new THREE.Vector3(1, 0, 0) },
      side: { position: new THREE.Vector3(0, 510, 0), up: new THREE.Vector3(0, 0, 1) },
    };
    camera.position.copy(presets[next].position);
    camera.up.copy(presets[next].up);
    controls.target.set(0, 0, 0);
    controls.update();
    setView(next);
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#071119");
    scene.fog = new THREE.FogExp2("#071119", 0.00125);
    const camera = new THREE.PerspectiveCamera(32, mount.clientWidth / mount.clientHeight, 0.1, 2000);
    camera.position.set(510, 0, 0);
    camera.up.set(0, 0, 1);
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    mount.appendChild(renderer.domElement);

    const gizmoMount = gizmoRef.current;
    const gizmoScene = new THREE.Scene();
    const gizmoCamera = new THREE.OrthographicCamera(-1.7, 1.7, 1.7, -1.7, 0.1, 20);
    let gizmoRenderer: THREE.WebGLRenderer | null = null;
    const gizmoTextures: THREE.CanvasTexture[] = [];
    if (gizmoMount) {
      gizmoRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      gizmoRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      gizmoRenderer.setSize(112, 112, false);
      gizmoRenderer.setClearColor(0x000000, 0);
      gizmoMount.appendChild(gizmoRenderer.domElement);
      const axes = [
        { dir: new THREE.Vector3(1, 0, 0), color: 0xff625c, positive: "A", negative: "P" },
        { dir: new THREE.Vector3(0, 1, 0), color: 0x52df87, positive: "R", negative: "L" },
        { dir: new THREE.Vector3(0, 0, 1), color: 0x58a6ff, positive: "D", negative: "V" },
      ];
      const makeLabel = (label: string, color: number, position: THREE.Vector3) => {
        const canvas = document.createElement("canvas"); canvas.width = 64; canvas.height = 64;
        const context = canvas.getContext("2d")!;
        context.font = "700 34px Arial"; context.textAlign = "center"; context.textBaseline = "middle";
        context.fillStyle = `#${color.toString(16).padStart(6, "0")}`; context.shadowColor = "rgba(0,0,0,.9)"; context.shadowBlur = 8;
        context.fillText(label, 32, 33);
        const texture = new THREE.CanvasTexture(canvas); gizmoTextures.push(texture);
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
        sprite.position.copy(position); sprite.scale.setScalar(0.42); gizmoScene.add(sprite);
      };
      axes.forEach(({ dir, color, positive, negative }) => {
        gizmoScene.add(new THREE.ArrowHelper(dir, new THREE.Vector3(), 1.08, color, 0.22, 0.13));
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([dir.clone().multiplyScalar(-1.02), new THREE.Vector3()]);
        gizmoScene.add(new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.65 })));
        makeLabel(positive, color, dir.clone().multiplyScalar(1.34));
        makeLabel(negative, color, dir.clone().multiplyScalar(-1.28));
      });
      gizmoScene.add(new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 8), new THREE.MeshBasicMaterial({ color: 0xb8d5df })));
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.rotateSpeed = 0.62;
    controls.zoomSpeed = 0.7;
    controls.minDistance = 230;
    controls.maxDistance = 760;
    controlsRef.current = controls;
    scene.add(new THREE.HemisphereLight("#d9efff", "#081018", 2.7));
    const key = new THREE.DirectionalLight("#ffffff", 3.8);
    key.position.set(-160, 220, 280); scene.add(key);
    const rim = new THREE.DirectionalLight("#64c8ff", 2.4);
    rim.position.set(220, -80, -240); scene.add(rim);

    const brain = new THREE.Group();
    scene.add(brain);
    const rawToAnatomical = new THREE.Matrix4().set(
      0, 0, -1, 0,
      1, 0, 0, 0,
      0, -1, 0, 0,
      0, 0, 0, 1,
    );
    const loader = new PLYLoader();
    let disposed = false;
    let completed = 0;
    const bounds = new THREE.Box3();
    meshNames.forEach((meshName) => {
      loader.load(`/neuropils/${meshName}.ply`, (geometry) => {
        if (disposed) return;
        geometry.applyMatrix4(rawToAnatomical);
        geometry.computeVertexNormals();
        geometry.computeBoundingBox();
        const region = baseRegion(meshName);
        const system = systemForRegion(region);
        const material = new THREE.MeshPhysicalMaterial({ color: system.color, roughness: 0.38, metalness: 0.04, clearcoat: 0.35, clearcoatRoughness: 0.4, transparent: true, opacity: 0.82, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = meshName;
        mesh.userData = { region, systemId: system.id, color: system.color };
        brain.add(mesh); meshRef.current.push(mesh);
        if (geometry.boundingBox) bounds.union(geometry.boundingBox);
        completed += 1; setLoaded(completed);
        if (completed === meshNames.length) {
          const center = new THREE.Vector3();
          const size = new THREE.Vector3();
          bounds.getCenter(center); bounds.getSize(size);
          meshRef.current.forEach((regionMesh) => regionMesh.position.sub(center));
          brain.scale.setScalar(245 / Math.max(size.x, size.y, size.z));
        }
      });
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(meshRef.current.filter((mesh) => mesh.visible), false)[0];
      if (hit) {
        const picked = hit.object as THREE.Mesh;
        setSelectedMesh(picked.name); setActiveSystem(picked.userData.systemId);
      }
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    const observer = new ResizeObserver(() => {
      if (!mount.clientWidth || !mount.clientHeight) return;
      camera.aspect = mount.clientWidth / mount.clientHeight; camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    });
    observer.observe(mount);
    let frame = 0;
    const render = () => {
      frame = requestAnimationFrame(render); controls.update(); renderer.render(scene, camera);
      if (gizmoRenderer) {
        gizmoCamera.position.copy(camera.position).sub(controls.target).normalize().multiplyScalar(5);
        gizmoCamera.up.copy(camera.up); gizmoCamera.lookAt(0, 0, 0);
        gizmoRenderer.render(gizmoScene, gizmoCamera);
      }
    };
    render();
    return () => {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown); controls.dispose();
      meshRef.current.forEach((mesh) => { mesh.geometry.dispose(); (mesh.material as THREE.Material).dispose(); });
      gizmoScene.traverse((object) => { if (object instanceof THREE.Mesh || object instanceof THREE.Line) { object.geometry.dispose(); (object.material as THREE.Material).dispose(); } });
      gizmoTextures.forEach((texture) => texture.dispose()); gizmoRenderer?.dispose(); gizmoRenderer?.domElement.remove();
      renderer.dispose(); renderer.domElement.remove(); meshRef.current = [];
    };
  }, []);

  useEffect(() => {
    meshRef.current.forEach((mesh) => {
      const material = mesh.material as THREE.MeshPhysicalMaterial;
      const isVisible = visibleSystems.has(mesh.userData.systemId);
      mesh.visible = isVisible;
      if (!isVisible) return;
      const selected = selectedMesh === mesh.name;
      const belongs = !activeSystem || mesh.userData.systemId === activeSystem;
      material.opacity = selected ? 1 : belongs ? 0.86 : 0.07;
      material.emissive.set(selected ? mesh.userData.color : "#000000");
      material.emissiveIntensity = selected ? 0.28 : 0;
      mesh.renderOrder = selected || belongs ? 2 : 0;
    });
  }, [activeSystem, selectedMesh, loaded, visibleSystems]);

  const selectedRegion = selectedMesh ? baseRegion(selectedMesh) : null;
  const selectedDetail = selectedRegion ? (language === "zh" ? regionDetails[selectedRegion] : regionDetailsEnglish[selectedRegion]) : null;
  const selectedSystem = selectedRegion ? systemForRegion(selectedRegion) : null;
  const chooseSystem = (id: string) => { setSelectedMesh(null); setActiveSystem((current) => current === id ? null : id); };
  const toggleSystemVisibility = (id: string) => {
    setVisibleSystems((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    if (activeSystem === id) setActiveSystem(null);
    if (selectedSystem?.id === id) setSelectedMesh(null);
  };

  return (
    <main className="atlas-shell">
      <header className="atlas-header">
        <div><p className="eyebrow">{copy.eyebrow}</p><h1>{copy.title}</h1></div>
        <div className="atlas-meta"><span><b>{loaded}</b> / 78 {copy.neuropils}</span><span className="meta-divider" /><span>FlyWire FAFB14.1 · JFRC2</span></div>
      </header>
      <section className="atlas-grid">
        <aside className="legend-column legend-left" aria-label={copy.leftLegend}>
          {systems.slice(0, 3).map((system) => <LegendCard key={system.id} system={system} language={language} active={activeSystem === system.id} visible={visibleSystems.has(system.id)} onSelect={() => chooseSystem(system.id)} onToggleVisibility={() => toggleSystemVisibility(system.id)} />)}
        </aside>
        <section className="viewer-panel">
          <div ref={mountRef} className="brain-canvas" aria-label={copy.canvas} />
          {loaded < meshNames.length && <div className="loading-card"><span className="loading-orbit" /><div><strong>{copy.loading}</strong><small>{Math.round((loaded / meshNames.length) * 100)}%</small></div></div>}
          <div className="view-toolbar" role="toolbar" aria-label={copy.viewToolbar}>
            {(["front", "top", "side"] as ViewName[]).map((name) => <button key={name} className={view === name ? "active" : ""} onClick={() => setCameraView(name)}>{copy.views[name]}</button>)}
          </div>
          <div ref={gizmoRef} className="orientation-gizmo" role="img" aria-label={copy.orientation} />
          <div className="gesture-hint"><span className="mouse-icon">↻</span><span>{copy.gesture}</span></div>
          <div className={`region-inspector ${selectedDetail ? "visible" : ""}`}>
            {selectedDetail && selectedSystem && selectedMesh && <><button className="close-inspector" onClick={() => { setSelectedMesh(null); setActiveSystem(null); }} aria-label={copy.close}>×</button><div className="inspector-label" style={{ color: selectedSystem.color }}>{language === "zh" ? selectedSystem.name : selectedSystem.english}</div><h2>{selectedDetail.name}</h2><p>{selectedDetail.function}</p><div className="inspector-code">{selectedMesh} · {selectedMesh.endsWith("_L") ? copy.hemispheres.left : selectedMesh.endsWith("_R") ? copy.hemispheres.right : copy.hemispheres.midline}</div></>}
          </div>
        </section>
        <aside className="legend-column legend-right" aria-label={copy.rightLegend}>
          {systems.slice(3).map((system) => <LegendCard key={system.id} system={system} language={language} active={activeSystem === system.id} visible={visibleSystems.has(system.id)} onSelect={() => chooseSystem(system.id)} onToggleVisibility={() => toggleSystemVisibility(system.id)} />)}
        </aside>
      </section>
      <footer className="atlas-footer">
        <div className="footer-left">
          <label className="language-switcher"><span>◎</span><select value={language} onChange={(event) => setLanguage(event.target.value as Language)} aria-label={copy.language}><option value="zh">中文</option><option value="en">English</option></select></label>
          <span>{copy.footer}</span>
        </div>
        <span>{copy.source}</span>
      </footer>
    </main>
  );
}
