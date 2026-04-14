# Pm Issues Handoff

## Summary
- **From**: pm-issues
- **To**: coding
- **Status**: Complete
- **Timestamp**: 2026-04-14T20:22:56.931056+00:00
- **Handoff ID**: 004_pm_issues_complete

## Work Completed
All 11 GitHub Issues created for the LEGO Builder Web App in sreenivasmrpivot/legobuilder-challenger-config1. Issues #7–#17 cover all FRs with full implementation scope, stub replacement tables, test ID references, acceptance criteria, and branch naming conventions. P0 issues (9): FR-SCENE-001 (#8), FR-BRICK-001 (#7), FR-BRICK-002 (#9), FR-BRICK-003 (#10), FR-TOOL-001 (#11), FR-TOOL-002 (#12), FR-PERS-001 (#13), FR-PERS-002 (#14), FR-PERF-001 (#15). P1 issues (2): FR-TOOL-003 (#16), FR-SHARE-001 (#17). Coding agent should implement P0 issues first, then P1.

## Artifacts Created
| Artifact | Path | Description |
|----------|------|-------------|
| GitHub Issue FR-BRICK-001 | https://github.com/sreenivasmrpivot/legobuilder-challenger-config1/issues/7 | FR-BRICK-001 Brick Placement with Grid Snapping, Collision Detection & Ghost Preview — P0 |
| GitHub Issue FR-SCENE-001 | https://github.com/sreenivasmrpivot/legobuilder-challenger-config1/issues/8 | FR-SCENE-001 3D Scene Rendering with R3F Canvas, Lighting & OrbitControls — P0 |
| GitHub Issue FR-BRICK-002 | https://github.com/sreenivasmrpivot/legobuilder-challenger-config1/issues/9 | FR-BRICK-002 Brick Color Selection Palette with LEGO Colors & Tooltips — P0 |
| GitHub Issue FR-BRICK-003 | https://github.com/sreenivasmrpivot/legobuilder-challenger-config1/issues/10 | FR-BRICK-003 Brick Type Selector with 4 Types & Footprint Logic — P0 |
| GitHub Issue FR-TOOL-001 | https://github.com/sreenivasmrpivot/legobuilder-challenger-config1/issues/11 | FR-TOOL-001 Place Mode Tool — Default Active Tool with Visual Highlight — P0 |
| GitHub Issue FR-TOOL-002 | https://github.com/sreenivasmrpivot/legobuilder-challenger-config1/issues/12 | FR-TOOL-002 Delete Mode Tool — Click Brick to Remove from Scene — P0 |
| GitHub Issue FR-PERS-001 | https://github.com/sreenivasmrpivot/legobuilder-challenger-config1/issues/13 | FR-PERS-001 Save Model to Browser Storage (LocalForage) with Success/Error Notification — P0 |
| GitHub Issue FR-PERS-002 | https://github.com/sreenivasmrpivot/legobuilder-challenger-config1/issues/14 | FR-PERS-002 Load Model from Browser Storage with Full Scene Restoration — P0 |
| GitHub Issue FR-PERF-001 | https://github.com/sreenivasmrpivot/legobuilder-challenger-config1/issues/15 | FR-PERF-001 Instanced Mesh Rendering for ≥30 FPS with 500 Bricks — P0 |
| GitHub Issue FR-TOOL-003 | https://github.com/sreenivasmrpivot/legobuilder-challenger-config1/issues/16 | FR-TOOL-003 Brick Rotation — 90° Y-Axis Increments via Button & R Keyboard Shortcut — P1 |
| GitHub Issue FR-SHARE-001 | https://github.com/sreenivasmrpivot/legobuilder-challenger-config1/issues/17 | FR-SHARE-001 JSON Export & Import for Model Sharing with Versioned Format — P1 |

## Human Review Required
None

## Recommended Actions for coding
1. Start with FR-SCENE-001 (#8) — foundational 3D canvas that all other FRs depend on
2. Implement FR-BRICK-001 (#7) next — core brick placement with grid snapping and collision detection
3. Implement FR-TOOL-001 (#11) and FR-TOOL-002 (#12) together — they share the Toolbar component
4. Implement FR-BRICK-002 (#9) and FR-BRICK-003 (#10) — color and type selectors are independent
5. Implement FR-PERS-001 (#13) and FR-PERS-002 (#14) together — they share ActionBar and persistenceService
6. Implement FR-PERF-001 (#15) — InstancedMesh rendering (can be done in parallel with UI work)
7. Implement P1 issues last: FR-TOOL-003 (#16) and FR-SHARE-001 (#17)
8. Each issue specifies the exact stub file to replace and the branch naming convention
9. All test IDs are specified in each issue — write tests first (TDD required per governance)
10. Reference docs/TECHNICAL_ARCHITECTURE.md section 3 for Framework Runtime Contracts (critical gotchas)
