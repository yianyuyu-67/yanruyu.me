# Clue Board Model Specification

- Nominal size: 12.0 wide and 8.8 high. The structural frame/backing depth is 0.72; pins and strings bring the measured overall depth to approximately 1.10.
- Origin: bottom-center of the frame; +Y up; +Z front.
- Frame bevel radius: 0.15 with 5 segments.
- Cork bevel radius: 0.12 with 5 segments.
- Paper bevel radius: 0.045-0.07 with 3 segments.
- String: `QuadraticBezierCurve3` + `TubeGeometry`, radius 0.027, 28 tubular segments, 7 radial segments.
- Pin head: radius 0.115, 18 radial segments, 12 height segments.

The rear panel and two rear mounting cleats are approximate because the source contains no rear view. Exact printed content is also approximate and is exposed through replaceable texture paths.
