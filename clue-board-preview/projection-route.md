# Projection Route

Full photo projection is intentionally not used. The user requires replaceable image paths for maps, photos, notes, and documents, so each sheet is an independent shallow solid with a generated placeholder canvas texture and a stable `texturePath` in `userData`.

The structural evidence from the source is used for proportions, layering, pin placement, and string routing. This avoids baking lighting and reference-specific text into the model while preserving later content replacement.
