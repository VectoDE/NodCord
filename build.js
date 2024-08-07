const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Erstelle den /build Ordner, wenn er nicht existiert
const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir);
}

// Kompiliere den Code mit Webpack
exec('npx webpack --config webpack.config.js', (err, stdout, stderr) => {
  if (err) {
    console.error(`Error during build: ${err.message}`);
    return;
  }
  if (stderr) {
    console.error(`Webpack stderr: ${stderr}`);
    return;
  }
  console.log(`Webpack stdout: ${stdout}`);

  // Verschiebe die Build-Dateien in den /build-Ordner
  const srcDir = path.join(__dirname, 'dist');
  const files = fs.readdirSync(srcDir);

  files.forEach((file) => {
    fs.renameSync(path.join(srcDir, file), path.join(buildDir, file));
  });

  console.log('Build files moved to /build directory.');

  // Entferne den Tests-Ordner
  const testDir = path.join(__dirname, 'src', 'tests');
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
    console.log('Tests directory removed.');
  }

  console.log('Build process completed.');
});
