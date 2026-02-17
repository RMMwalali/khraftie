const { createBucketClient } = require('@cosmicjs/sdk');
const fs = require('fs');
const path = require('path');

// Initialize Cosmic client
const cosmic = createBucketClient({
  bucketSlug: process.env.PUBLIC_COSMIC_BUCKET_SLUG,
  readKey: process.env.PUBLIC_COSMIC_READ_KEY
});

// Content mapping
const contentMap = {
  'hero-content': {
    slug: 'homepage-hero',
    file: './src/content/homepage/hero.json'
  },
  'clients-content': {
    slug: 'homepage-clients',
    file: './src/content/homepage/clients.json'
  },
  'features-general': {
    slug: 'homepage-features-general',
    file: './src/content/homepage/features-general.json'
  },
  'features-tabs': {
    slug: 'homepage-features-tabs',
    file: './src/content/homepage/features-tabs.json'
  },
  'testimonials': {
    slug: 'homepage-testimonials',
    file: './src/content/homepage/testimonials.json'
  },
  'faq': {
    slug: 'homepage-faq',
    file: './src/content/homepage/faq.json'
  },
  'cta': {
    slug: 'homepage-cta',
    file: './src/content/homepage/cta.json'
  },
  'about-content': {
    slug: 'about-page',
    file: './src/content/pages/about.json'
  },
  'services-content': {
    slug: 'services-page',
    file: './src/content/pages/services.json'
  },
  'contact-content': {
    slug: 'contact-page',
    file: './src/content/pages/contact.json'
  }
};

async function syncContent() {
  console.log('Syncing content from Cosmic CMS...');
  
  let hasChanges = false;
  
  for (const [contentType, config] of Object.entries(contentMap)) {
    try {
      const data = await cosmic.objects.findOne({
        type: contentType,
        slug: config.slug
      });
      
      if (data.object) {
        const content = data.object.metadata;
        const jsonString = JSON.stringify(content, null, 2);
        
        // Check if file exists and compare content
        let currentContent = '';
        if (fs.existsSync(config.file)) {
          currentContent = fs.readFileSync(config.file, 'utf8');
        }
        
        if (currentContent !== jsonString) {
          console.log(`Updating ${config.file}`);
          fs.writeFileSync(config.file, jsonString);
          hasChanges = true;
        }
      }
    } catch (error) {
      console.log(`Error syncing ${contentType}:`, error.message);
    }
  }
  
  if (hasChanges) {
    console.log('Content updated! Triggering build...');
    await buildAndDeploy();
  } else {
    console.log('No content changes found.');
  }
}

async function buildAndDeploy() {
  const { exec } = require('child_process');
  
  exec('npm run build', (error, stdout, stderr) => {
    if (error) {
      console.error(`Build error: ${error}`);
      return;
    }
    
    console.log('Build completed!');
    console.log('Ready to deploy to cPanel');
    
    // You can add automatic FTP deployment here
    // deployToFtp();
  });
}

// Run sync
syncContent();
