import { createRoot } from 'react-dom/client';
import React from 'react';
import { App } from './app';
import './global.css';

function main() {
  const root = createRoot(document.body);

  root.render(<React.StrictMode><App /></React.StrictMode>);
}

main();
