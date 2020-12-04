import {register} from 'ts-node';

register({
  compilerOptions: {
    module: 'commonjs',
  },
  transpileOnly: true,
});

require('./public/index');
