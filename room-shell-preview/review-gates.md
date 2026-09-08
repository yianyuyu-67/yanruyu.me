# multi-angle review and deterministic checks

- Browser render: `review-front.png`, `review-left.png`, `review-right.png`, `review-top.png`, `review-rear.png`; no console errors.
- Multi-angle silhouette gate: `degenerate: false`; area ratios left 1.325, right 1.206, top 1.889, rear 1.750 against front. No planar collapse.
- Tier-1 pixel diagnostics were not used as an acceptance score against the full multi-panel reference: the reference admission tool reports a fragmented mask (largest connected blob 0.561), and a photo-vs-procedural global IoU is not meaningful for this layout sheet. This is recorded as a limitation, not a geometry pass.
- Visual review decision: `continue` for the independent preview artifact. Remaining uncertainty is limited to hidden rear/underside joinery and exact window/door hardware.
