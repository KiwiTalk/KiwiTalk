// Usage: node build.js <platform> [extra_platforms...]

const path = require('path');
const NwBuilder = require('nw-builder');

var nw = new NwBuilder({
  files: ['package.json', './build/**', './img/**', 'entry.js'],
  flavor: 'normal',
  buildType: 'versioned',
  buildDir: './release',
  platforms: process.argv.slice(2),
  version: '0.50.2',
  
  winIco: './img/winIcon.ico'
});

// Logging
nw.on('log',  console.log);

let startTime = Date.now();
nw.build().then(function () {
  let time = (Date.now() - startTime) / 1000;
  console.log(`Build complete! ${time.toFixed(2)} sec(s)`);
}).catch(function (error) {
  console.error(error);
});
