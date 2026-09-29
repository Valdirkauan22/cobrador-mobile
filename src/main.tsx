import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { loadConfig } from './utils/storage';
import { applyTheme } from './utils/theme';

// Aplica o tema imediatamente para evitar flashes na abertura
applyTheme(loadConfig().theme || 'system');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      reg.update();
    });
  });
}
