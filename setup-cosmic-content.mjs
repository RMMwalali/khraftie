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

async function createObjectType(type, title, metafields) {
  try {
    console.log(`🔍 Checking if object type '${type}' exists...`)
    
    // Try to create object type directly
    const newType = await cosmic.objectTypes.insertOne({
      title,
      slug: type,
      metafields
    })
    
    console.log(`✅ Created object type: ${type}`)
    return newType.object
  } catch (error) {
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      console.log(`✅ Object type '${type}' already exists`)
      return null
    }
    console.error(`❌ Error creating object type ${type}:`, error.message)
    return null
  }
}

async function createContentObject(type, slug, metadata) {
  try {
    console.log(`🔍 Checking if content object '${slug}' exists...`)
    
    // Try to create content object directly
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

async function setupCosmicContent() {
  console.log('🚀 Setting up Cosmic CMS content automatically...')

  // Define metafields for each content type
  const heroMetafields = [
    { type: 'text', title: 'Title', key: 'title', required: true },
    { type: 'textarea', title: 'Subtitle', key: 'subTitle', required: true },
    { type: 'text', title: 'Primary Button', key: 'primaryBtn' },
    { type: 'text', title: 'Primary Button URL', key: 'primaryBtnURL' },
    { type: 'text', title: 'Secondary Button', key: 'secondaryBtn' },
    { type: 'text', title: 'Secondary Button URL', key: 'secondaryBtnURL' },
    { type: 'toggle', title: 'With Review', key: 'withReview', default_value: false },
    { type: 'text', title: 'Video Source', key: 'videoSrc' },
    { type: 'text', title: 'Video Type', key: 'videoType', default_value: 'video/mp4' },
    { type: 'text', title: 'Video Alt', key: 'alt' }
  ]

  const clientsMetafields = [
    { type: 'text', title: 'Title', key: 'title', required: true },
    { type: 'textarea', title: 'Subtitle', key: 'subTitle', required: true },
    {
      type: 'repeater',
      title: 'Partners',
      key: 'partners',
      repeater_fields: [
        { type: 'text', title: 'Name', key: 'name' },
        { type: 'file', title: 'Icon', key: 'icon' },
        { type: 'text', title: 'Link', key: 'href' }
      ]
    }
  ]

  const featuresGeneralMetafields = [
    { type: 'text', title: 'Title', key: 'title', required: true },
    { type: 'textarea', title: 'Subtitle', key: 'subTitle', required: true },
    { type: 'file', title: 'Image', key: 'image' },
    { type: 'text', title: 'Image Alt', key: 'imageAlt' },
    {
      type: 'repeater',
      title: 'Features',
      key: 'features',
      repeater_fields: [
        { type: 'text', title: 'Heading', key: 'heading', required: true },
        { type: 'textarea', title: 'Content', key: 'content', required: true },
        { type: 'text', title: 'Icon', key: 'svg' }
      ]
    }
  ]

  const featuresTabsMetafields = [
    { type: 'text', title: 'Title', key: 'title', required: true },
    {
      type: 'repeater',
      title: 'Tabs',
      key: 'tabs',
      repeater_fields: [
        { type: 'text', title: 'Heading', key: 'heading', required: true },
        { type: 'textarea', title: 'Content', key: 'content', required: true },
        { type: 'text', title: 'Icon', key: 'svg' },
        { type: 'file', title: 'Image', key: 'src' },
        { type: 'text', title: 'Image Alt', key: 'alt' },
        { type: 'toggle', title: 'First Tab', key: 'first' },
        { type: 'toggle', title: 'Second Style', key: 'second' }
      ]
    }
  ]

  const testimonialsMetafields = [
    { type: 'text', title: 'Title', key: 'title', required: true },
    { type: 'textarea', title: 'Subtitle', key: 'subTitle', required: true },
    {
      type: 'repeater',
      title: 'Testimonials',
      key: 'testimonials',
      repeater_fields: [
        { type: 'textarea', title: 'Content', key: 'content', required: true },
        { type: 'text', title: 'Author', key: 'author', required: true },
        { type: 'text', title: 'Role', key: 'role' },
        { type: 'file', title: 'Avatar', key: 'avatarSrc' }
      ]
    },
    {
      type: 'repeater',
      title: 'Statistics',
      key: 'statistics',
      repeater_fields: [
        { type: 'text', title: 'Count', key: 'count', required: true },
        { type: 'text', title: 'Description', key: 'description', required: true }
      ]
    }
  ]

  const faqMetafields = [
    { type: 'text', title: 'Title', key: 'title', required: true },
    {
      type: 'object',
      title: 'FAQs',
      key: 'faqs',
      object_fields: [
        { type: 'textarea', title: 'Subtitle', key: 'subTitle' },
        {
          type: 'repeater',
          title: 'Questions',
          key: 'faqs',
          repeater_fields: [
            { type: 'text', title: 'Question', key: 'question', required: true },
            { type: 'textarea', title: 'Answer', key: 'answer', required: true }
          ]
        }
      ]
    }
  ]

  const ctaMetafields = [
    { type: 'text', title: 'Title', key: 'title', required: true },
    { type: 'textarea', title: 'Subtitle', key: 'subTitle', required: true },
    { type: 'text', title: 'Button Label', key: 'buttonLabel', required: true },
    { type: 'text', title: 'Button URL', key: 'url', required: true }
  ]

  // Create object types
  console.log('\n📝 Creating object types...')
  await createObjectType('hero-content', 'Hero Content', heroMetafields)
  await createObjectType('clients-content', 'Clients Content', clientsMetafields)
  await createObjectType('features-general', 'Features General', featuresGeneralMetafields)
  await createObjectType('features-tabs', 'Features Tabs', featuresTabsMetafields)
  await createObjectType('testimonials', 'Testimonials', testimonialsMetafields)
  await createObjectType('faq', 'FAQ', faqMetafields)
  await createObjectType('cta', 'Call To Action', ctaMetafields)

  // Wait a moment for object types to be created
  console.log('\n⏳ Waiting for object types to be created...')
  await new Promise(resolve => setTimeout(resolve, 3000))

  // Create content objects with existing data
  console.log('\n📄 Creating content objects...')
  await createContentObject('hero-content', 'homepage-hero', heroJson)
  await createContentObject('clients-content', 'homepage-clients', clientsJson)
  await createContentObject('features-general', 'homepage-features-general', featuresGeneralJson)
  await createContentObject('features-tabs', 'homepage-features-tabs', featuresTabsJson)
  await createContentObject('testimonials', 'homepage-testimonials', testimonialsJson)
  await createContentObject('faq', 'homepage-faq', faqJson)
  await createContentObject('cta', 'homepage-cta', ctaJson)

  console.log('\n🎉 Cosmic CMS setup complete!')
  console.log('\n📋 Next steps:')
  console.log('1. Restart your dev server: npm run dev')
  console.log('2. Visit http://localhost:4322')
  console.log('3. Your website is now powered by Cosmic CMS!')
}

// Run the setup
setupCosmicContent().catch(console.error)
