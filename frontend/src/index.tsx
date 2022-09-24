import { createRoot } from 'react-dom/client';
import React from 'react';
import { App } from './app';

function main() {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const root = createRoot(document.getElementById('root')!);

  root.render(<React.StrictMode><App /></React.StrictMode>);
}

window.addEventListener('DOMContentLoaded', () => main());
