import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock WebGL context for Three.js
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn((contextType: string) => {
    if (contextType === 'webgl2' || contextType === 'webgl') {
      return {
        getExtension: vi.fn(() => null),
        getParameter: vi.fn(() => 0),
        createBuffer: vi.fn(() => ({})),
        bindBuffer: vi.fn(),
        bufferData: vi.fn(),
        createShader: vi.fn(() => ({})),
        shaderSource: vi.fn(),
        compileShader: vi.fn(),
        getShaderParameter: vi.fn(() => true),
        createProgram: vi.fn(() => ({})),
        attachShader: vi.fn(),
        linkProgram: vi.fn(),
        getProgramParameter: vi.fn(() => true),
        useProgram: vi.fn(),
        createTexture: vi.fn(() => ({})),
        bindTexture: vi.fn(),
        texImage2D: vi.fn(),
        texParameteri: vi.fn(),
        createFramebuffer: vi.fn(() => ({})),
        bindFramebuffer: vi.fn(),
        framebufferTexture2D: vi.fn(),
        viewport: vi.fn(),
        clearColor: vi.fn(),
        clear: vi.fn(),
        enable: vi.fn(),
        disable: vi.fn(),
        blendFunc: vi.fn(),
        depthFunc: vi.fn(),
        drawArrays: vi.fn(),
        drawElements: vi.fn(),
        getUniformLocation: vi.fn(() => ({})),
        uniform1i: vi.fn(),
        uniform1f: vi.fn(),
        uniform3fv: vi.fn(),
        uniform4fv: vi.fn(),
        uniformMatrix4fv: vi.fn(),
        getAttribLocation: vi.fn(() => 0),
        enableVertexAttribArray: vi.fn(),
        vertexAttribPointer: vi.fn(),
        createVertexArray: vi.fn(() => ({})),
        bindVertexArray: vi.fn(),
        canvas: document.createElement('canvas'),
        drawingBufferWidth: 800,
        drawingBufferHeight: 600,
      };
    }
    return null;
  }),
  writable: true,
});

// Mock LocalForage
vi.mock('localforage', () => ({
  default: {
    setItem: vi.fn().mockResolvedValue(undefined),
    getItem: vi.fn().mockResolvedValue(null),
    removeItem: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock uuid for deterministic test IDs
let uuidCounter = 0;
vi.mock('uuid', () => ({
  v4: vi.fn(() => `test-uuid-${++uuidCounter}`),
}));

beforeEach(() => {
  uuidCounter = 0;
});
