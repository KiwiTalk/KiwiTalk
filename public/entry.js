// eslint-disable-next-line @typescript-eslint/no-var-requires
require('ts-node').register({
  compilerOptions: {
    module: 'commonjs',
  },
  transpileOnly: true,
});

require('./index');
