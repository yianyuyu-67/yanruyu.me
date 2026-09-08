# qualityContract

- target: real-time procedural Three.js `roomShell` prop, stylized miniature architecture.
- hard features: continuous rear wall; 90-degree side-wall joins; 1.5-unit wall thickness; open front/top; stepped roof profile; connected left raised sign with window/plaque; embedded right door and checker steps; single asymmetric base cutout.
- geometry: ExtrudeGeometry for base and rear/side wall solids; RoundedBoxGeometry for trims, frames and small architectural members; bevel segments 4-5.
- materials: warm cream wall (roughness 0.88), low-contrast wood grain trim/floor/base, matte blue-violet door, subdued metal/black window and grille.
- runtime: one root `roomShell`, independent named children, target under 25k triangles and no external texture dependency.
- review: front, left, right, top and rear views; verify open front, wall thickness, base footprint, no floating trim, no self-intersection.
