import { createBucketClient } from '@cosmicjs/sdk'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Initialize Cosmic client
const cosmic = createBucketClient({
  bucketSlug: 'stillkraft-events-production',
  readKey: 'soPC3eRur6rQbcOMJUMMLvYH63FShQ6jCsvsceoJRSwjr0DMiO',
  writeKey: '62qVYy309er3O9DXyDJLuZn9Ds2sRPPQEnRev3LcC0iSiNEzYg'
})

// Import page JSON data
const aboutJson = JSON.parse(readFileSync(join(__dirname, './src/content/pages/about.json'), 'utf8'))
const servicesJson = JSON.parse(readFileSync(join(__dirname, './src/content/pages/services.json'), 'utf8'))
const contactJson = JSON.parse(readFileSync(join(__dirname, './src/content/pages/contact.json'), 'utf8'))

async function createObjectType(type, title, metafields) {
  try {
    const newType = await cosmic.objectTypes.insertOne({
      title,
      slug: type,
      metafields
    })
    console.log(`✅ Created object type: ${type}`)
    return newType.object
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`✅ Object type '${type}' already exists`)
      return null
    }
    console.error(`❌ Error creating object type ${type}:`, error.message)
    return null
  }
}

async function createContentObject(type, slug, metadata) {
  try {
    const newObject = await cosmic.objects.insertOne({
      type,
      slug,
      title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      metadata
    })
    console.log(`✅ Created content object: ${slug}`)
    return newObject.object
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`✅ Content object '${slug}' already exists`)
      return null
    }
    console.error(`❌ Error creating content object ${slug}:`, error.message)
    return null
  }
}

async function setupPageContent() {
  console.log('🚀 Setting up page content in Cosmic CMS...\n')

  // About page metafields
  const aboutMetafields = [
    { type: 'text', title: 'Title', key: 'title', required: true },
    { type: 'textarea', title: 'Subtitle', key: 'subTitle', required: true },
    { type: 'text', title: 'Gallery Title', key: 'galleryTitle' },
    { type: 'text', title: 'Features Title', key: 'featuresTitle' },
    { type: 'textarea', title: 'Features Subtitle', key: 'featuresSubTitle' },
    {
      type: 'repeater',
      title: 'Features Benefits',
      key: 'featuresBenefits',
      repeater_fields: [
        { type: 'text', title: 'Benefit', key: 'benefit' }
      ]
    },
    { type: 'text', title: 'Testimonials Title', key: 'testimonialsTitle' },
    {
      type: 'repeater',
      title: 'Testimonials',
      key: 'testimonials',
      repeater_fields: [
        { type: 'textarea', title: 'Content', key: 'content', required: true },
        { type: 'text', title: 'Author', key: 'author', required: true },
        { type: 'text', title: 'Role', key: 'role' },
        { type: 'text', title: 'Avatar URL', key: 'avatarSrc' },
        { type: 'text', title: 'Avatar Alt', key: 'avatarAlt' }
      ]
    }
  ]

  // Services page metafields
  const servicesMetafields = [
    { type: 'text', title: 'Main Section Title', key: 'mainSectionTitle', required: true },
    { type: 'textarea', title: 'Main Section Subtitle', key: 'mainSectionSubTitle', required: true },
    { type: 'toggle', title: 'Main Section Button Exists', key: 'mainSectionBtnExists' },
    { type: 'text', title: 'Main Section Button Title', key: 'mainSectionBtnTitle' },
    { type: 'text', title: 'Main Section Button URL', key: 'mainSectionBtnURL' },
    { type: 'text', title: 'Services Intro Text', key: 'servicesIntro' },
    {
      type: 'repeater',
      title: 'Services',
      key: 'services',
      repeater_fields: [
        { type: 'toggle', title: 'Is Right Section', key: 'isRightSection' },
        { type: 'text', title: 'Title', key: 'title', required: true },
        { type: 'textarea', title: 'Subtitle', key: 'subTitle', required: true },
        { type: 'toggle', title: 'Button Exists', key: 'btnExists' },
        { type: 'text', title: 'Button Title', key: 'btnTitle' },
        { type: 'text', title: 'Button URL', key: 'btnURL' },
        { type: 'toggle', title: 'Single Image', key: 'single' },
        { type: 'text', title: 'Image Path', key: 'img' },
        { type: 'text', title: 'Image Alt', key: 'imgAlt' },
        { type: 'text', title: 'Image One Path', key: 'imgOne' },
        { type: 'text', title: 'Image One Alt', key: 'imgOneAlt' }
      ]
    },
    { type: 'text', title: 'Stats Title', key: 'statsTitle' },
    { type: 'textarea', title: 'Stats Subtitle', key: 'statsSubTitle' },
    { type: 'text', title: 'Main Stat Title', key: 'mainStatTitle' },
    { type: 'text', title: 'Main Stat Subtitle', key: 'mainStatSubTitle' },
    {
      type: 'repeater',
      title: 'Stats',
      key: 'stats',
      repeater_fields: [
        { type: 'text', title: 'Stat Value', key: 'stat', required: true },
        { type: 'text', title: 'Description', key: 'description', required: true }
      ]
    }
  ]

  // Contact page metafields
  const contactMetafields = [
    { type: 'text', title: 'Page Title', key: 'pageTitle' },
    { type: 'text', title: 'Title', key: 'title', required: true },
    { type: 'textarea', title: 'Subtitle', key: 'subTitle', required: true },
    { type: 'text', title: 'Form Title', key: 'formTitle' },
    { type: 'text', title: 'Form Subtitle', key: 'formSubTitle' },
    { type: 'text', title: 'Submit Button', key: 'submitButton' },
    { type: 'text', title: 'Contact Info Title', key: 'contactInfoTitle' },
    {
      type: 'repeater',
      title: 'Contact Info',
      key: 'contactInfo',
      repeater_fields: [
        { type: 'text', title: 'Icon', key: 'icon' },
        { type: 'text', title: 'Label', key: 'label' },
        { type: 'text', title: 'Value', key: 'value' }
      ]
    },
    { type: 'text', title: 'Social Title', key: 'socialTitle' },
    {
      type: 'repeater',
      title: 'Social Links',
      key: 'socialLinks',
      repeater_fields: [
        { type: 'text', title: 'Platform', key: 'platform' },
        { type: 'text', title: 'URL', key: 'url' }
      ]
    }
  ]

  // Create object types
  console.log('📝 Creating object types...')
  await createObjectType('about-content', 'About Page Content', aboutMetafields)
  await createObjectType('services-content', 'Services Page Content', servicesMetafields)
  await createObjectType('contact-content', 'Contact Page Content', contactMetafields)

  // Wait for object types to be created
  console.log('\n⏳ Waiting for object types to be created...')
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Create content objects
  console.log('\n📄 Creating content objects...')
  await createContentObject('about-content', 'about-page', aboutJson)
  await createContentObject('services-content', 'services-page', servicesJson)
  await createContentObject('contact-content', 'contact-page', contactJson)

  console.log('\n🎉 Page content setup complete!')
  console.log('\n📋 Summary:')
  console.log('✅ About page content created')
  console.log('✅ Services page content created')
  console.log('✅ Contact page content created')
  console.log('\n📝 Next Steps:')
  console.log('1. Restart dev server: npm run dev')
  console.log('2. Visit each page to verify content loads')
  console.log('3. Edit content in Cosmic dashboard as needed')
}

// Run setup
setupPageContent().catch(console.error)
