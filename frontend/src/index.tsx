import { createRoot } from 'react-dom/client';
import React from 'react';
import { App } from './app';
import './global.css';

function main() {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Cannot find root element');
  }

  const root = createRoot(rootElement);

  root.render(<React.StrictMode><App /></React.StrictMode>);
}

window.addEventListener('DOMContentLoaded', () => main());
