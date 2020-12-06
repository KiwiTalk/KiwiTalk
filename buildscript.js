// Usage: node buildscript.js <platform> [extra_platforms...]
// eslint-disable-next-line @typescript-eslint/no-var-requires
const NwBuilder = require('nw-builder');

const nw = new NwBuilder({
  files: ['package.json', './build/**', './img/**', 'entry.js'],
  flavor: 'normal',
  buildType: 'versioned',
  buildDir: './release',
  platforms: process.argv.slice(2),
  version: '0.50.2',

  winIco: './img/winIcon.ico',
});

// Logging
nw.on('log', console.log);

const startTime = Date.now();
nw.build().then(function() {
  const time = (Date.now() - startTime) / 1000;
  console.log(`Build complete! ${time.toFixed(2)} sec(s)`);
}).catch(function(error) {
  console.error(error);
});
