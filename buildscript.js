// Usage: node buildscript.js <platform> [extra_platforms...]
// eslint-disable-next-line @typescript-eslint/no-var-requires
const NwBuilder = require('nw-builder');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Utils = require('nw-builder/lib/utils');

NwBuilder.prototype.checkFiles = function() {
  return Utils.getFileList(this.options.files)
      .then((data) => {
        data.files.forEach((file) => {
          if (file.dest.includes('build')) file.dest = file.dest.replace(/build[\\/]*/g, '');
        }); // build 폴더의 파일을 위로 끌어올림.
        this._appPkg = data.json;
        this._files = data.files;
        return this._appPkg;
      })
      .then(Utils.getPackageInfo)
      .then((appPkg) => {
        this._appPkg = appPkg;

        if (!this.options.appName || !this.options.appVersion) {
          this.options.appName = (this.options.appName ? this.options.appName : appPkg.name);
          this.options.appVersion =
          (this.options.appVersion ? this.options.appVersion : appPkg.version);
        }
      });
};

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
