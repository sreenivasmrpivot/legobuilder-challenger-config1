# Research Analysis: LEGO Builder Web Application

## Project Requirements (from Navigator handoff)

- Build a web-based LEGO builder application that works in browsers
- New project requiring research into optimal architecture, features, and technology stack
- Target: sreenivasmrpivot/legobuilder-challenger-config1
- App ID: app-legobuilder-challenger-config1-20240615

## Existing Org Repos

- sreenivasmrpivot/lego-builder - A simple Lego builder web app for kids built with React/Next.js (empty repository, no README content available)

## Market & Competitive Landscape

### Existing Solutions

1. LEGO Digital Designer (discontinued) - Desktop application for building with virtual LEGO bricks
2. BrickLink Studio - Popular free 3D LEGO building software with extensive part library
3. LEGO Builder Journey (mobile) - Touch-optimized LEGO building experience
4. Web-based LEGO simulators - Various hobbyist projects using Three.js, Babylon.js, or WebGL

### Market Opportunities

- No dominant web-based LEGO builder with modern UX
- Growing interest in browser-based 3D experiences (WebGL/WebGPU)
- Potential for collaborative building features
- Opportunity for integration with physical LEGO sets (via part numbers, instructions)

### Competitive Differentiators to Consider

- Performance: Fast loading, smooth 60fps interactions
- Accessibility: Works across devices (desktop, tablet)
- Part library: Up-to-date with current LEGO parts and colors
- Sharing: Easy export/import of models, sharing via URL
- Extensibility: Plugin architecture for custom parts or features

## Technical Recommendations

### Frontend Architecture

- Framework: React or Vue.js for component-based UI
- 3D Rendering: Three.js (mature, large ecosystem) or Babylon.js (more features out of box)
- State Management: Zustand or Redux Toolkit for predictable state
- Build Tool: Vite for fast development and optimized production builds

### Backend Considerations (if needed)

- API: Node.js/Express or Python/FastAPI for model storage, user accounts
- Database: PostgreSQL for structured data, Redis for caching
- File Storage: S3-compatible storage for model exports/imports
- Real-time: WebSockets (Socket.io) for collaborative building (future phase)

### Deployment

- Frontend: Vercel, Netlify, or Cloudflare Pages for static hosting
- Backend: Railway, Render, or AWS/Azure/GCP for API
- CDN: Cloudflare for global asset delivery

## Key Libraries / Frameworks to Consider

### 3D & Graphics

- three - Core 3D library
- @react-three/fiber - React renderer for Three.js (if using React)
- @react-three/drei - Useful helpers for R3F
- three-stdlib - Official Three.js examples and loaders
- gltf - For model export/import (GLTF/GLB format)

### UI Components

- @mui/material or chakra-ui - Component library for consistent design
- react-dnd or dnd-kit - Drag-and-drop for part palette
- zustand - Lightweight state management

### Utilities

- uuid - Unique IDs for bricks
- immer - Immutable state updates
- lodash - Utility functions
- compression - For compressed model storage

### Development & Testing

- vitest - Fast unit testing
- @testing-library/react - Component testing
- cypress - E2E testing
- eslint + prettier - Code quality

## Risks and Open Questions

### Technical Risks

1. Performance at Scale: Large models (thousands of bricks) may cause frame rate drops
   - Mitigation: Instanced rendering, LOD, frustum culling
2. Browser Compatibility: WebGL support is widespread but not universal
   - Mitigation: Graceful degradation, feature detection
3. State Complexity: Brick placement, selection, undo/redo can become complex
   - Mitigation: Command pattern, immutable data structures
4. Part Library Size: Official LEGO part library is huge (~10k parts)
   - Mitigation: Start with subset, lazy-load parts, use simplified collision meshes

### Product Risks

1. Scope Creep: Many possible features (collaboration, instructions, AR, etc.)
   - Mitigation: MVP focus, phased roadmap
2. Legal: LEGO trademark and part data usage
   - Mitigation: Use unofficial part libraries (e.g., LDraw), consult legal
3. User Engagement: Building alone may not sustain interest
   - Mitigation: Social features, challenges, contests

### Open Questions

- Should we support saving/loading models? (likely yes)
- What is the target part count for MVP? (e.g., 100-500 bricks)
- Do we need user accounts? (maybe optional, local-first)
- Should we support physical LEGO set instructions import? (future)
- What platforms must we support? (desktop-first, then mobile?)
- Color accuracy: How closely must we match official LEGO colors?

## Recommended Architecture Direction

### High-Level Design

```
┌─────────────────┐    ┌─────────────────────────────────────────┐
│   Browser       │    │         Cloud (optional)               │
│                 │    │                                         │
│  ┌───────────┐  │    │  ┌─────────┐  ┌─────────────────────┐  │
│  │ React UI  │◄──┼───►│  │ API    │  │   Object Storage    │  │
│  │ Components│  │    │  │ (Node) │  │   (S3/Cloudflare R2)│  │
│  └───────────┘  │    │  └─────────┘  └─────────────────────┘  │
│         │       │    │                 ▲                     │
│         ▼       │    │                 │                     │
│  ┌───────────┐  │    │  ┌─────────┐    │                     │
│  │ Three.js   │  │    │  │ Auth    │    │                     │
│  │ Scene      │  │    │  │ (optional)│   │                     │
│  └───────────┘  │    │  └─────────┘    │                     │
│         │       │    │                 │                     │
│         ▼       │    │  ┌─────────┐    │                     │
│  ┌───────────┐  │    │  │ Database│◄───┘                     │
│  │ WebGL     │  │    │  │ (Postgres)│                         │
│  │ Renderer  │  │    │  └─────────┘                          │
│  └───────────┘  │    │                                         │
└─────────────────┘    └─────────────────────────────────────────┘
```

### Core Modules (Frontend)

1. **Brick System**
   - Brick geometry generation (using Three.js primitives)
   - Collision detection for placement
   - Brick registry (LDraw or custom part definitions)

2. **Scene Manager**
   - Three.js scene, camera, renderer
   - Lighting setup
   - Grid/plate handling

3. **Interaction Layer**
   - Mouse/touch picking
   - Drag to place bricks
   - Rotation, color selection
   - Undo/redo stack

4. **UI Components**
   - Part palette (search, filter)
   - Color picker
   - Toolbar (select, move, delete, rotate)
   - Model info (brick count, part list)

5. **Persistence**
   - Save/load to localStorage (offline-first)
   - Export to GLTF/GLB
   - Import from GLTF/JSON

### Data Model (simplified)

```typescript
interface Brick {
  id: string;
  partId: string; // e.g., "3001" for 2x4 brick
  color: string; // hex or official color code
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
}

interface Model {
  id: string;
  name: string;
  bricks: Brick[];
  metadata: {
    created: Date;
    modified: Date;
    brickCount: number;
  };
}
```

### Performance Strategy

- Use InstancedMesh for identical bricks to reduce draw calls
- Implement frustum culling (Three.js built-in)
- Limit scene graph depth
- Debounce heavy operations (rebuild geometry)
- Web Worker for part library parsing if needed

### MVP Scope Recommendation

- Single view (no multi-floor/baseplate for now)
- Basic brick shapes: 2x4, 2x2, 1x2, 1x1 (studs up/down/side)
- Standard color palette (20-30 common colors)
- Local storage persistence only
- Export to GLB
- Undo/redo (50 steps)
- Responsive layout (desktop-first, tablet support)

### Future Phases

- Full LDraw part library support
- Collaborative real-time editing
- Instruction generation
- AR preview (WebXR)
- Mobile touch gestures
- Integration with BrickLink/LEGO APIs (if available)
- Community sharing platform

## Conclusion

This research indicates a React + Three.js (via @react-three/fiber) stack is optimal for rapid development with strong community support. The existing org repo lego-builder suggests prior interest; we should review its code if it becomes non-empty. The MVP should focus on core building mechanics with clean architecture to allow future expansion.

Next steps: PM to define detailed PRD and feature prioritization based on this analysis.
