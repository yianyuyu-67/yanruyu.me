# detail inventory

| ID | Feature | Component mapping | Realization |
|---|---|---|---|
| rear-step | stepped rear-wall top | `backWall/backWallSolid` | elevation extrusion |
| left-sign | high rounded left extension | `leftRaisedSign` | connected beveled members |
| sign-window | framed flower-window approximation | `leftRaisedSign/signWindow` | recessed backing + iron cross |
| left-window | left wall window | `leftWall/leftWindow` | recessed panel + frame + mullions |
| right-door | embedded blue-violet door | `rightWall/doorFrame/door` | segmented side-wall opening |
| steps | two checker steps | `rightWall/doorSteps` | layered rounded tiles |
| base-cutout | asymmetric front recess | `baseTrim/baseCutout`, `baseFloor` | one continuous extruded polygon |
| top-plaques | left and right plaques | `leftPlaque`, `rightLongPlaque` | independent plate/inset groups |
