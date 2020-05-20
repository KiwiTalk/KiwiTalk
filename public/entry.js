require("ts-node").register({
  compilerOptions: {
    module: 'commonjs'
  },
  transpileOnly: true
});

require("./index");