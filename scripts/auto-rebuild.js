const { createBucketClient } = require('@cosmicjs/sdk');

// Initialize Cosmic client
const cosmic = createBucketClient({
  bucketSlug: process.env.PUBLIC_COSMIC_BUCKET_SLUG,
  readKey: process.env.PUBLIC_COSMIC_READ_KEY
});

// Store last modified timestamps
const lastModified = {
  'hero-content': null,
  'clients-content': null,
  'features-general': null,
  'features-tabs': null,
  'testimonials': null,
  'faq': null,
  'cta': null,
  'about-content': null,
  'services-content': null,
  'contact-content': null
};

async function checkForUpdates() {
  console.log('Checking for Cosmic CMS updates...');
  
  let hasUpdates = false;
  
  for (const [contentType, lastTime] of Object.entries(lastModified)) {
    try {
      const data = await cosmic.objects.findOne({
        type: contentType,
        slug: contentType === 'hero-content' ? 'homepage-hero' :
              contentType === 'clients-content' ? 'homepage-clients' :
              contentType === 'features-general' ? 'homepage-features-general' :
              contentType === 'features-tabs' ? 'homepage-features-tabs' :
              contentType === 'testimonials' ? 'homepage-testimonials' :
              contentType === 'faq' ? 'homepage-faq' :
              contentType === 'cta' ? 'homepage-cta' :
              contentType === 'about-content' ? 'about-page' :
              contentType === 'services-content' ? 'services-page' :
              contentType === 'contact-content' ? 'contact-page' : null
      }).props('modified_at');
      
      if (data.object) {
        const modifiedTime = new Date(data.object.modified_at);
        
        if (!lastTime || modifiedTime > new Date(lastTime)) {
          console.log(`Update detected in ${contentType}`);
          lastModified[contentType] = modifiedTime;
          hasUpdates = true;
        }
      }
    } catch (error) {
      console.log(`Error checking ${contentType}:`, error.message);
    }
  }
  
  if (hasUpdates) {
    console.log('Updates found! Triggering rebuild...');
    await triggerRebuild();
  } else {
    console.log('No updates found.');
  }
}

async function triggerRebuild() {
  const { exec } = require('child_process');
  
  console.log('Starting rebuild process...');
  
  exec('npm run build', (error, stdout, stderr) => {
    if (error) {
      console.error(`Build error: ${error}`);
      return;
    }
    
    console.log('Build completed successfully!');
    
    // Optional: Deploy to cPanel
    deployToCPanel();
  });
}

function deployToCPanel() {
  // Add your cPanel deployment logic here
  // This could be FTP upload, rsync, etc.
  console.log('Deploying to cPanel...');
  
  // Example using FTP (you'd need to install ftp package)
  // const ftp = require('basic-ftp');
  // ... FTP upload logic
}

// Check every 5 minutes (300000 ms)
setInterval(checkForUpdates, 300000);

// Run immediately on start
checkForUpdates();

console.log('Auto-rebuild service started. Checking every 5 minutes.');
