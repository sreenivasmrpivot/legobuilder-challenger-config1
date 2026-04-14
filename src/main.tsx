import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

// Global error tracking for E2E tests (KR-1.3: zero WebGL errors)
declare global {
  interface Window {
    __legoBuilderErrors: string[];
  }
}
window.__legoBuilderErrors = [];

const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  const msg = args.join(' ');
  if (msg.includes('WebGL') || msg.includes('THREE')) {
    window.__legoBuilderErrors.push(msg);
  }
  originalConsoleError(...args);
};

window.addEventListener('error', (event) => {
  console.error('[LEGO Builder] Uncaught error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[LEGO Builder] Unhandled promise rejection:', event.reason);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
