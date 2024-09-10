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

// Function to recursively get all entry points in the src directory
function getAllEntryPoints(dir) {
  let entryPoints = [];
  fs.readdirSync(dir, { withFileTypes: true }).forEach(file => {
    const res = path.resolve(dir, file.name);
    if (file.isDirectory()) {
      entryPoints = entryPoints.concat(getAllEntryPoints(res));
    } else if (file.isFile() && file.name.endsWith('.js')) {
      entryPoints.push(res);
    }
  });
  return entryPoints;
}

// Get all entry points from the src directory
const entryPoints = getAllEntryPoints(srcDir);

// Build options for esbuild
esbuild.build({
  entryPoints: entryPoints,  // Use all found entry points
  outdir: buildDir,         // Output directory
  bundle: true,             // Bundle all dependencies into one file
  minify: true,             // Minify the output
  sourcemap: true,          // Generate .js.map files
  target: ['es2020'],       // Target a specific version of JavaScript (adjust as needed)
  platform: 'node',         // Platform is node for backend applications
  format: 'cjs',            // CommonJS format for node
  logLevel: 'info',         // Log level (info, error, etc.)
  loader: {
    '.html': 'text',        // Handle .html files as text
  },
  external: [
    'mock-aws-s3',
    'aws-sdk',
    'nock',
    'typescript'
  ]
}).then(() => {
  console.log('Build successful!');
}).catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
