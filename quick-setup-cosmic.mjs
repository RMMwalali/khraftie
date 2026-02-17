import { createBucketClient } from '@cosmicjs/sdk'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Initialize Cosmic client with write access
const cosmic = createBucketClient({
  bucketSlug: 'stillkraft-events-production',
  readKey: 'soPC3eRur6rQbcOMJUMMLvYH63FShQ6jCsvsceoJRSwjr0DMiO',
  writeKey: '62qVYy309er3O9DXyDJLuZn9Ds2sRPPQEnRev3LcC0iSiNEzYg'
})

// Import existing JSON data
const heroJson = JSON.parse(readFileSync(join(__dirname, './src/content/homepage/hero.json'), 'utf8'))
const clientsJson = JSON.parse(readFileSync(join(__dirname, './src/content/homepage/clients.json'), 'utf8'))
const featuresGeneralJson = JSON.parse(readFileSync(join(__dirname, './src/content/homepage/features-general.json'), 'utf8'))
const featuresTabsJson = JSON.parse(readFileSync(join(__dirname, './src/content/homepage/features-tabs.json'), 'utf8'))
const testimonialsJson = JSON.parse(readFileSync(join(__dirname, './src/content/homepage/testimonials.json'), 'utf8'))
const faqJson = JSON.parse(readFileSync(join(__dirname, './src/content/homepage/faq.json'), 'utf8'))
const ctaJson = JSON.parse(readFileSync(join(__dirname, './src/content/homepage/cta.json'), 'utf8'))

async function createSimpleContentObject(type, slug, metadata) {
  try {
    console.log(`🔍 Creating content object '${slug}'...`)
    
    const newObject = await cosmic.objects.insertOne({
      type,
      slug,
      title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      metadata
    })
    
    console.log(`✅ Created content object: ${slug}`)
    return newObject.object
  } catch (error) {
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      console.log(`✅ Content object '${slug}' already exists`)
      return null
    }
    console.error(`❌ Error creating content object ${slug}:`, error.message)
    return null
  }
}

async function quickSetup() {
  console.log('🚀 Quick Cosmic CMS Setup - Creating content objects only...')
  console.log('📝 Note: Make sure object types are created manually first!')

  // Create content objects with existing data
  await createSimpleContentObject('hero-content', 'homepage-hero', heroJson)
  await createSimpleContentObject('clients-content', 'homepage-clients', clientsJson)
  await createSimpleContentObject('features-general', 'homepage-features-general', featuresGeneralJson)
  await createSimpleContentObject('features-tabs', 'homepage-features-tabs', featuresTabsJson)
  await createSimpleContentObject('testimonials', 'homepage-testimonials', testimonialsJson)
  await createSimpleContentObject('faq', 'homepage-faq', faqJson)
  await createSimpleContentObject('cta', 'homepage-cta', ctaJson)

  console.log('\n🎉 Quick setup complete!')
  console.log('\n📋 What was created:')
  console.log('✅ Content objects with all your existing data')
  console.log('\n📋 What you need to do manually:')
  console.log('1. Create missing object types in Cosmic dashboard')
  console.log('2. Use the MANUAL_COSMIC_SETUP.md guide for exact field structure')
  console.log('3. Restart dev server: npm run dev')
  console.log('4. Visit http://localhost:4322')
}

// Run quick setup
quickSetup().catch(console.error)
