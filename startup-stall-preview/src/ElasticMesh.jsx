import { useEffect, useRef } from "react";
import { Geometry, Mesh, Program, Renderer, Texture } from "ogl";
import "./ElasticMesh.css";

const DIST = 4.6;
const FIT = 0.82;

const VERT = `
precision highp float;
attribute vec2 aGrid;
attribute vec2 uv;
attribute vec3 aOffset;
attribute vec3 aNormal;

uniform float uAspect;
uniform float uTilt;
uniform float uDist;
uniform float uFit;

varying vec2 vUv;
varying vec3 vNormal;
varying float vDepth;

void main() {
  vUv = uv;
  vec2 base = vec2((aGrid.x * 2.0 - 1.0) * uAspect, 1.0 - aGrid.y * 2.0);
  vec3 p = vec3(base + aOffset.xy, aOffset.z);

  float ct = cos(uTilt);
  float st = sin(uTilt);
  float ry = p.y * ct - p.z * st;
  float rz = p.y * st + p.z * ct;
  p.y = ry;
  p.z = rz;

  float persp = uDist / (uDist - p.z);
  vec2 clip = vec2(p.x / uAspect, p.y) * persp * uFit;
  vNormal = aNormal;
  vDepth = aOffset.z;
  gl_Position = vec4(clip, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

varying vec2 vUv;
varying vec3 vNormal;
varying float vDepth;

uniform sampler2D tMap;
uniform float uHasImage;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uHighlight;
uniform float uShading;
uniform vec2 uRes;
uniform float uRadius;
uniform float uGrid;
uniform float uGridDensity;
uniform float uGridOpacity;
uniform vec3 uGridColor;

void main() {
  vec3 base;
  if (uHasImage > 0.5) {
    base = texture2D(tMap, vUv).rgb;
  } else {
    base = mix(uColor1, uColor2, clamp(vUv.y, 0.0, 1.0));
  }

  vec3 N = normalize(vNormal);
  vec3 L = normalize(vec3(-0.35, 0.55, 0.78));
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 H = normalize(L + V);
  float diff = clamp(dot(N, L), 0.0, 1.0);
  float specRaw = pow(clamp(dot(N, H), 0.0, 1.0), 26.0);
  float specFlat = pow(clamp(H.z, 0.0, 1.0), 26.0);
  float spec = clamp((specRaw - specFlat) / (1.0 - specFlat), 0.0, 1.0);
  float ao = clamp(1.0 + vDepth * 0.45, 0.65, 1.25);

  vec3 lit = base * (1.0 - uShading * 0.28);
  lit += base * diff * uShading * 0.55;
  lit *= ao;
  lit += uHighlight * spec * uShading * 0.25;

  if (uGrid > 0.5) {
    vec2 g = vUv * uGridDensity;
    vec2 w = uGridDensity / max(uRes, vec2(1.0));
    vec2 d = abs(fract(g - 0.5) - 0.5) / max(w * 1.5, vec2(1e-4));
    float line = 1.0 - clamp(min(d.x, d.y), 0.0, 1.0);
    lit = mix(lit, uGridColor, line * uGridOpacity * (0.45 + diff * 0.55));
  }

  vec2 p = (vUv - 0.5) * uRes;
  vec2 halfRes = uRes * 0.5;
  float r = min(uRadius, min(halfRes.x, halfRes.y));
  vec2 q = abs(p) - (halfRes - r);
  float sd = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  float alpha = 1.0 - smoothstep(-1.25, 1.25, sd);
  if (alpha <= 0.002) discard;
  gl_FragColor = vec4(lit, alpha);
}
`;

function hexToRgb(hex) {
  let value = (hex || "").replace("#", "").trim();
  if (value.length === 3) value = value.split("").map((character) => character + character).join("");
  const number = parseInt(value || "000000", 16);
  return [((number >> 16) & 255) / 255, ((number >> 8) & 255) / 255, (number & 255) / 255];
}

export default function ElasticMesh({
  image = "",
  color1 = "#5227FF",
  color2 = "#B19EEF",
  highlight = "#ffffff",
  showGrid = true,
  gridDensity = 20,
  gridOpacity = 0.28,
  gridColor = "#ffffff",
  borderRadius = 25,
  stiffness = 0.05,
  damping = 0.2,
  grabRadius = 0.6,
  pull = 0.4,
  wobble = 5,
  tilt = 14,
  shading = 0.5,
  resolution = 25,
  interaction = "hover",
  enabled = true,
  className = "",
  style,
  ...rest
}) {
  const containerRef = useRef(null);
  const propsRef = useRef({});
  propsRef.current = {
    color1,
    color2,
    highlight,
    showGrid,
    gridDensity,
    gridOpacity,
    gridColor,
    borderRadius,
    stiffness,
    damping,
    grabRadius,
    pull,
    wobble,
    tilt,
    shading,
    interaction,
    enabled,
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio || 1, 2) });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const nodeResolution = Math.max(6, Math.min(40, Math.round(resolution)));
    const nodeCount = nodeResolution * nodeResolution;
    const aGrid = new Float32Array(nodeCount * 2);
    const uv = new Float32Array(nodeCount * 2);
    const aOffset = new Float32Array(nodeCount * 3);
    const aNormal = new Float32Array(nodeCount * 3);

    for (let row = 0; row < nodeResolution; row += 1) {
      for (let column = 0; column < nodeResolution; column += 1) {
        const index = row * nodeResolution + column;
        const u = column / (nodeResolution - 1);
        const v = row / (nodeResolution - 1);
        aGrid[index * 2] = u;
        aGrid[index * 2 + 1] = v;
        uv[index * 2] = u;
        uv[index * 2 + 1] = v;
        aNormal[index * 3 + 2] = 1;
      }
    }

    const quadCount = (nodeResolution - 1) * (nodeResolution - 1);
    const indices = new Uint16Array(quadCount * 6);
    let indexOffset = 0;
    for (let row = 0; row < nodeResolution - 1; row += 1) {
      for (let column = 0; column < nodeResolution - 1; column += 1) {
        const a = row * nodeResolution + column;
        const b = a + 1;
        const c = a + nodeResolution;
        const d = c + 1;
        indices[indexOffset++] = a;
        indices[indexOffset++] = c;
        indices[indexOffset++] = b;
        indices[indexOffset++] = b;
        indices[indexOffset++] = c;
        indices[indexOffset++] = d;
      }
    }

    const geometry = new Geometry(gl, {
      aGrid: { size: 2, data: aGrid },
      uv: { size: 2, data: uv },
      aOffset: { size: 3, data: aOffset },
      aNormal: { size: 3, data: aNormal },
      index: { data: indices },
    });

    const texture = new Texture(gl, { generateMipmaps: false, flipY: false });
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      transparent: true,
      cullFace: null,
      uniforms: {
        tMap: { value: texture },
        uHasImage: { value: 0 },
        uColor1: { value: hexToRgb(color1) },
        uColor2: { value: hexToRgb(color2) },
        uHighlight: { value: hexToRgb(highlight) },
        uGrid: { value: showGrid ? 1 : 0 },
        uGridDensity: { value: gridDensity },
        uGridOpacity: { value: gridOpacity },
        uGridColor: { value: hexToRgb(gridColor) },
        uShading: { value: shading },
        uRes: { value: [1, 1] },
        uRadius: { value: borderRadius },
        uAspect: { value: 1 },
        uTilt: { value: (tilt * Math.PI) / 180 },
        uDist: { value: DIST },
        uFit: { value: FIT },
      },
    });

    if (image) {
      const source = new Image();
      source.crossOrigin = "anonymous";
      source.src = image;
      source.onload = () => {
        texture.image = source;
        program.uniforms.uHasImage.value = 1;
      };
    }

    const mesh = new Mesh(gl, { geometry, program });
    const baseX = new Float32Array(nodeCount);
    const baseY = new Float32Array(nodeCount);
    const position = new Float32Array(nodeCount * 3);
    const velocity = new Float32Array(nodeCount * 3);
    const acceleration = new Float32Array(nodeCount * 3);
    let aspect = 1;

    function refreshBase() {
      for (let index = 0; index < nodeCount; index += 1) {
        baseX[index] = (aGrid[index * 2] * 2 - 1) * aspect;
        baseY[index] = 1 - aGrid[index * 2 + 1] * 2;
      }
    }

    function resize() {
      const width = container.offsetWidth || 1;
      const height = container.offsetHeight || 1;
      renderer.setSize(width, height);
      aspect = width / height;
      program.uniforms.uAspect.value = aspect;
      program.uniforms.uRes.value = [width, height];
      refreshBase();
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const pointer = { x: 0, y: 0, tx: 0, ty: 0, active: false, targetActive: false };
    function toPlane(clientX, clientY) {
      const rect = container.getBoundingClientRect();
      const mouseX = (clientX - rect.left) / rect.width;
      const mouseY = (clientY - rect.top) / rect.height;
      const clipX = mouseX * 2 - 1;
      const clipY = 1 - mouseY * 2;
      const angle = ((propsRef.current.tilt || 0) * Math.PI) / 180;
      const cosTilt = Math.cos(angle);
      const sinTilt = Math.sin(angle);
      const projection = clipY / (cosTilt * FIT * DIST);
      const planeY = (projection * DIST) / (1 + projection * sinTilt);
      const perspective = DIST / (DIST - planeY * sinTilt);
      pointer.tx = (clipX * aspect) / (perspective * FIT);
      pointer.ty = planeY;
    }

    function onMove(event) {
      toPlane(event.clientX, event.clientY);
      if (propsRef.current.interaction === "hover") pointer.targetActive = true;
    }
    function onEnter() {
      if (propsRef.current.interaction === "hover") pointer.targetActive = true;
    }
    function onLeave() {
      pointer.targetActive = false;
    }
    function onDown(event) {
      if (propsRef.current.interaction !== "drag") return;
      toPlane(event.clientX, event.clientY);
      pointer.x = pointer.tx;
      pointer.y = pointer.ty;
      pointer.targetActive = true;
    }
    function onUp() {
      if (propsRef.current.interaction === "drag") pointer.targetActive = false;
    }
    function onTouch(event) {
      if (!event.touches.length) return;
      toPlane(event.touches[0].clientX, event.touches[0].clientY);
      pointer.targetActive = true;
    }

    container.addEventListener("mousemove", onMove);
    container.addEventListener("mouseenter", onEnter);
    container.addEventListener("mouseleave", onLeave);
    container.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    container.addEventListener("touchstart", onTouch, { passive: true });
    container.addEventListener("touchmove", onTouch, { passive: true });
    container.addEventListener("touchend", onLeave);

    const STEP = 1 / 120;
    const MAX_SUBSTEPS = 5;
    let accumulatedTime = 0;
    let lastFrame = performance.now();

    function substep() {
      const props = propsRef.current;
      const retain = 1 - props.damping;
      const coupling = 0.06 + props.wobble * 0.032;
      const active = pointer.active && props.enabled && !reduceMotion;
      const radius = Math.max(0.08, props.grabRadius) * 1.4;
      const inverseRadius = 1 / radius;
      const force = props.pull * 0.009;

      for (let row = 0; row < nodeResolution; row += 1) {
        for (let column = 0; column < nodeResolution; column += 1) {
          const index = row * nodeResolution + column;
          const offset = index * 3;
          const x = position[offset];
          const y = position[offset + 1];
          const z = position[offset + 2];
          let ax = -props.stiffness * x;
          let ay = -props.stiffness * y;
          let az = -props.stiffness * z;
          let sumX = 0;
          let sumY = 0;
          let sumZ = 0;
          let neighborCount = 0;

          const addNeighbor = (neighbor) => {
            const neighborOffset = neighbor * 3;
            sumX += position[neighborOffset];
            sumY += position[neighborOffset + 1];
            sumZ += position[neighborOffset + 2];
            neighborCount += 1;
          };
          if (column > 0) addNeighbor(index - 1);
          if (column < nodeResolution - 1) addNeighbor(index + 1);
          if (row > 0) addNeighbor(index - nodeResolution);
          if (row < nodeResolution - 1) addNeighbor(index + nodeResolution);

          ax += coupling * (sumX - neighborCount * x);
          ay += coupling * (sumY - neighborCount * y);
          az += coupling * (sumZ - neighborCount * z);

          if (active) {
            const distanceX = pointer.x - (baseX[index] + x);
            const distanceY = pointer.y - (baseY[index] + y);
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            const normalized = distance * inverseRadius;
            if (normalized < 1) {
              const bump = 1 - normalized * normalized;
              az += force * bump * bump * 6;
              if (distance > 1e-4) {
                const pinch = normalized * (1 - normalized) * (1 - normalized) * 6.75;
                const direction = (force * pinch * 1.6) / distance;
                ax += distanceX * direction;
                ay += distanceY * direction;
              }
            }
          }

          acceleration[offset] = ax;
          acceleration[offset + 1] = ay;
          acceleration[offset + 2] = az;
        }
      }

      for (let index = 0; index < nodeCount; index += 1) {
        const offset = index * 3;
        for (let axis = 0; axis < 3; axis += 1) {
          const component = offset + axis;
          const nextVelocity = (velocity[component] + acceleration[component]) * retain;
          velocity[component] = nextVelocity;
          position[component] = Math.max(-1.2, Math.min(1.2, position[component] + nextVelocity));
        }
      }
    }

    function commit() {
      for (let row = 0; row < nodeResolution; row += 1) {
        for (let column = 0; column < nodeResolution; column += 1) {
          const index = row * nodeResolution + column;
          const offset = index * 3;
          const left = column > 0 ? index - 1 : index;
          const right = column < nodeResolution - 1 ? index + 1 : index;
          const down = row > 0 ? index - nodeResolution : index;
          const up = row < nodeResolution - 1 ? index + nodeResolution : index;
          const leftOffset = left * 3;
          const rightOffset = right * 3;
          const downOffset = down * 3;
          const upOffset = up * 3;
          const tangentX = [
            baseX[right] + position[rightOffset] - baseX[left] - position[leftOffset],
            baseY[right] + position[rightOffset + 1] - baseY[left] - position[leftOffset + 1],
            position[rightOffset + 2] - position[leftOffset + 2],
          ];
          const tangentY = [
            baseX[up] + position[upOffset] - baseX[down] - position[downOffset],
            baseY[up] + position[upOffset + 1] - baseY[down] - position[downOffset + 1],
            position[upOffset + 2] - position[downOffset + 2],
          ];
          let normalX = tangentX[1] * tangentY[2] - tangentX[2] * tangentY[1];
          let normalY = tangentX[2] * tangentY[0] - tangentX[0] * tangentY[2];
          let normalZ = tangentX[0] * tangentY[1] - tangentX[1] * tangentY[0];
          if (normalZ < 0) {
            normalX = -normalX;
            normalY = -normalY;
            normalZ = -normalZ;
          }
          const length = Math.sqrt(normalX * normalX + normalY * normalY + normalZ * normalZ) || 1;
          aNormal[offset] = normalX / length;
          aNormal[offset + 1] = normalY / length;
          aNormal[offset + 2] = normalZ / length;
          aOffset[offset] = position[offset];
          aOffset[offset + 1] = position[offset + 1];
          aOffset[offset + 2] = position[offset + 2];
        }
      }
      geometry.attributes.aOffset.needsUpdate = true;
      geometry.attributes.aNormal.needsUpdate = true;
    }

    let animationFrame = 0;
    function frame(now) {
      animationFrame = requestAnimationFrame(frame);
      const props = propsRef.current;
      program.uniforms.uShading.value = props.shading;
      program.uniforms.uRadius.value = props.borderRadius;
      program.uniforms.uTilt.value = (props.tilt * Math.PI) / 180;
      program.uniforms.uColor1.value = hexToRgb(props.color1);
      program.uniforms.uColor2.value = hexToRgb(props.color2);
      program.uniforms.uHighlight.value = hexToRgb(props.highlight);
      program.uniforms.uGrid.value = props.showGrid ? 1 : 0;
      program.uniforms.uGridDensity.value = props.gridDensity;
      program.uniforms.uGridOpacity.value = props.gridOpacity;
      program.uniforms.uGridColor.value = hexToRgb(props.gridColor);

      let deltaTime = (now - lastFrame) / 1000;
      lastFrame = now;
      if (deltaTime > 0.25) deltaTime = 0.25;
      const lerp = 1 - Math.exp(-Math.max(deltaTime, 1e-4) / 0.06);
      pointer.x += (pointer.tx - pointer.x) * lerp;
      pointer.y += (pointer.ty - pointer.y) * lerp;
      pointer.active = pointer.targetActive;

      accumulatedTime += deltaTime;
      let substeps = 0;
      while (accumulatedTime >= STEP && substeps < MAX_SUBSTEPS) {
        substep();
        accumulatedTime -= STEP;
        substeps += 1;
      }
      if (accumulatedTime > STEP) accumulatedTime = 0;
      commit();
      renderer.render({ scene: mesh });
    }

    animationFrame = requestAnimationFrame(frame);
    container.appendChild(gl.canvas);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseenter", onEnter);
      container.removeEventListener("mouseleave", onLeave);
      container.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      container.removeEventListener("touchstart", onTouch);
      container.removeEventListener("touchmove", onTouch);
      container.removeEventListener("touchend", onLeave);
      if (gl.canvas.parentElement === container) container.removeChild(gl.canvas);
      const loseContext = gl.getExtension("WEBGL_lose_context");
      if (loseContext) loseContext.loseContext();
    };
  }, [image, resolution]);

  return <div ref={containerRef} className={`elastic-mesh${className ? ` ${className}` : ""}`} style={style} {...rest} />;
}
