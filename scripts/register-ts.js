// This script registers ts-node to handle TypeScript files
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    target: 'es2017',
    esModuleInterop: true,
    jsx: 'react-native',
    allowJs: true,
    resolveJsonModule: true,
    moduleResolution: 'node',
    noEmit: true,
    skipLibCheck: true,
    allowSyntheticDefaultImports: true,
    isolatedModules: true,
    strict: true,
  },
});