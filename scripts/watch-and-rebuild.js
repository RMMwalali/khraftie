const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Watch JSON content files for changes
const contentFiles = [
  './src/content/homepage/hero.json',
  './src/content/homepage/clients.json',
  './src/content/homepage/features-general.json',
  './src/content/homepage/features-tabs.json',
  './src/content/homepage/testimonials.json',
  './src/content/homepage/faq.json',
  './src/content/homepage/cta.json',
  './src/content/pages/about.json',
  './src/content/pages/services.json',
  './src/content/pages/contact.json'
];

let rebuildTimeout = null;

function triggerRebuild() {
  // Debounce rebuilds - wait 10 seconds after last change
  if (rebuildTimeout) {
    clearTimeout(rebuildTimeout);
  }
  
  rebuildTimeout = setTimeout(() => {
    console.log('Content change detected! Starting rebuild...');
    
    exec('npm run build', (error, stdout, stderr) => {
      if (error) {
        console.error(`Build error: ${error}`);
        return;
      }
      
      console.log('Build completed successfully!');
      deployToCPanel();
    });
  }, 10000);
}

function deployToCPanel() {
  console.log('Deploying to cPanel...');
  // Add your deployment logic here
}

// Watch each file
contentFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`Watching ${file}`);
    
    fs.watchFile(file, (curr, prev) => {
      if (curr.mtime !== prev.mtime) {
        console.log(`Change detected in ${file}`);
        triggerRebuild();
      }
    });
  }
});

console.log('File watcher started. Monitoring content files...');
