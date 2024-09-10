const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

// Source and build directories
const srcDir = path.join(__dirname, 'src');
const buildDir = path.join(__dirname, 'build');

// Ensure build directory exists
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir);
}

// Build options for esbuild
esbuild.build({
  entryPoints: [path.join(srcDir, 'server.js')],  // Assuming your entry file is index.js in ./src
  outdir: buildDir,  // Output directory
  bundle: true,      // Bundle all dependencies into one file
  minify: true,      // Minify the output
  sourcemap: true,   // Generate .js.map files
  target: ['es2020'],  // Target a specific version of JavaScript (adjust as needed)
  platform: 'node',   // Platform is node for backend applications
  format: 'cjs',      // CommonJS format for node
  logLevel: 'info',   // Log level (info, error, etc.)
}).then(() => {
  console.log('Build successful!');
}).catch(() => process.exit(1));
