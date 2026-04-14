# LEGO Builder Web App

A browser-based 3D LEGO building application. Place, color, rotate, and arrange virtual LEGO bricks in a 3D scene using WebGL rendering. No installation required.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript 5 |
| Build Tool | Vite 5 |
| 3D Rendering | React Three Fiber 8 + Three.js 0.165 + @react-three/drei 9 |
| State Management | Zustand 4 |
| UI Styling | Tailwind CSS 3 |
| Browser Storage | LocalForage 1.10 |
| Unit Tests | Vitest 1 + React Testing Library 14 |
| E2E Tests | Playwright 1 |
| Package Manager | pnpm 8 |

## Quick Start

```bash
make install  # Install dependencies
make dev      # Start dev server (http://localhost:5173)
```

## Testing

```bash
make test           # Unit tests
make test-coverage  # Unit tests with coverage
make test-e2e       # E2E tests (builds first)
make ci             # Full CI pipeline
```

## Docker

```bash
make docker-build  # Build Docker image (node:20-alpine + nginx:alpine)
make docker-run    # Run production image (http://localhost:8080)
make docker-dev    # Development with Docker Compose
```

## Controls

| Action | Control |
|--------|--------|
| Place brick | Left click on grid |
| Delete brick | Switch to Delete mode, left click |
| Orbit camera | Right click + drag |
| Zoom | Scroll wheel |
| Pan | Middle click + drag |
| Place mode | P key |
| Delete mode | D key |

## Architecture

See `docs/TECHNICAL_ARCHITECTURE.md` for full technical architecture.

## Governance

- `docs/PRD.md` - Product Requirements (11 FRs, 9 NFRs)
- `docs/TEST_PLAN.md` - Test Plan (55 test cases)
- `docs/NOTIONAL_ARCHITECTURE.md` - System Design
- `docs/tech_stack.yaml` - Technology Choices
- `docs/TECHNICAL_ARCHITECTURE.md` - Technical Architecture
