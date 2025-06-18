// This file is used by tape to handle TypeScript files
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    target: 'es2018',
    esModuleInterop: true
  }
});
