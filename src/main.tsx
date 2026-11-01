import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress known non-fatal HMR WebSocket connection failure messages in proxy iframe
window.addEventListener('error', (event) => {
  if (
    event.message &&
    (event.message.includes('WebSocket') ||
      event.message.includes('vite') ||
      event.message.includes('createWebSocketModuleRunnerTransport'))
  ) {
    event.preventDefault();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const reason = String(event.reason || '');
  if (reason.includes('WebSocket') || reason.includes('vite')) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
