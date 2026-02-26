import { createBucketClient } from '@cosmicjs/sdk'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createRequire } from 'module'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const require = createRequire(import.meta.url)
let matter
try {
  matter = require('gray-matter')
} catch (_) {
  matter = null
}

function loadEnvFromFile(envPath = '.env') {
  try {
    const raw = fs.readFileSync(envPath, 'utf8')
    raw.split(/\r?\n/).forEach((line) => {
      const l = line.trim()
      if (!l || l.startsWith('#')) return
      const idx = l.indexOf('=')
      if (idx === -1) return
      const key = l.slice(0, idx).trim()
      const val = l.slice(idx + 1).trim()
      if (!process.env[key]) process.env[key] = val
    })
  } catch (e) {
    // no .env file, ok
  }
}

function normalizeContentsToRepeater(contents, body) {
  if (Array.isArray(contents) && contents.length > 0) {
    return contents.map((c) => ({ content: String(c) }))
  }
  const trimmed = (body || '').trim()
  if (!trimmed) return []
  return [{ content: trimmed }]
}

function normalizeCosmicDate(value) {
  if (!value) return null
  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return value.toISOString().slice(0, 10)
  }
  const s = String(value).trim()
  if (!s) return null
  // Accept YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  const d = new Date(s)
  if (!Number.isNaN(d.valueOf())) return d.toISOString().slice(0, 10)
  return null
}

function resolveMarkdownAssetPath(markdownAbsPath, assetRef) {
  if (!assetRef || typeof assetRef !== 'string') return null
  if (/^https?:\/\//i.test(assetRef)) return assetRef
  if (assetRef.startsWith('@/')) {
    return join(__dirname, assetRef.replace(/^@\//, 'src/'))
  }
  // Relative to markdown file folder
  return join(dirname(markdownAbsPath), assetRef)
}

async function upsertObject(cosmicClient, type, slug, metadata, title) {
  try {
    let existingId = null
    try {
      const existing = await cosmicClient.objects.findOne({ type, slug }).props('id')
      if (existing && existing.object && existing.object.id) {
        existingId = existing.object.id
      }
    } catch (_) {}

    if (existingId) {
      await cosmicClient.objects.updateOne(existingId, {
        type,
        slug,
        title: title || slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        status: 'published',
        metadata
      })
      console.log(`🔁 Updated object: ${type}/${slug}`)
      return
    }

    await cosmicClient.objects.insertOne({
      type,
      slug,
      title: title || slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      status: 'published',
      metadata
    })
    console.log(`✅ Created object: ${type}/${slug}`)
  } catch (err) {
    console.warn(`⚠️  Could not upsert object '${type}/${slug}': ${err?.message || err}`)
  }
}

async function importLocalPostsEnglishOnly(cosmicClient) {
  if (!matter) {
    console.warn('⚠️  gray-matter is not installed. Skipping local post import. Run: npm i -D gray-matter')
    return
  }

  const blogDir = join(__dirname, 'src/content/blog/en')
  const insightsDir = join(__dirname, 'src/content/insights/en')

  const readDirMd = (dir) => {
    if (!fs.existsSync(dir)) return []
    return fs.readdirSync(dir).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
  }

  const blogFiles = readDirMd(blogDir)
  const insightFiles = readDirMd(insightsDir)

  for (const file of blogFiles) {
    const originalSlug = file.replace(/\.(md|mdx)$/i, '')
    const slug = `blog-${originalSlug}`
    const mdAbsPath = join(blogDir, file)
    const raw = fs.readFileSync(mdAbsPath, 'utf8')
    const parsed = matter(raw)
    const fm = parsed?.data || {}

    const authorImagePath = resolveMarkdownAssetPath(mdAbsPath, fm.authorImage)
    const cardImagePath = resolveMarkdownAssetPath(mdAbsPath, fm.cardImage)
    const authorImage = typeof authorImagePath === 'string' && /^https?:\/\//i.test(authorImagePath)
      ? authorImagePath
      : null
    const cardImage = typeof cardImagePath === 'string' && /^https?:\/\//i.test(cardImagePath)
      ? cardImagePath
      : null

    const metadata = {
      title: fm.title || slug,
      description: fm.description || '',
      contents: normalizeContentsToRepeater(fm.contents, parsed?.content),
      author: fm.author || '',
      role: fm.role || '',
      authorImage,
      authorImageAlt: fm.authorImageAlt || '',
      pubDate: normalizeCosmicDate(fm.pubDate),
      cardImage,
      cardImageAlt: fm.cardImageAlt || '',
      readTime: typeof fm.readTime === 'number' ? fm.readTime : Number(fm.readTime || 0),
      tags: Array.isArray(fm.tags) ? fm.tags.map((t) => ({ tag: String(t) })) : [],
      category: 'blog'
    }

    if (!metadata.pubDate) delete metadata.pubDate
    if (!metadata.authorImage) delete metadata.authorImage
    if (!metadata.cardImage) delete metadata.cardImage

    await upsertObject(cosmicClient, 'posts', slug, metadata, metadata.title)
  }

  for (const file of insightFiles) {
    const originalSlug = file.replace(/\.(md|mdx)$/i, '')
    const slug = `insight-${originalSlug}`
    const mdAbsPath = join(insightsDir, file)
    const raw = fs.readFileSync(mdAbsPath, 'utf8')
    const parsed = matter(raw)
    const fm = parsed?.data || {}

    const cardImagePath = resolveMarkdownAssetPath(mdAbsPath, fm.cardImage)
    const cardImage = typeof cardImagePath === 'string' && /^https?:\/\//i.test(cardImagePath)
      ? cardImagePath
      : null
    const metadata = {
      title: fm.title || slug,
      description: fm.description || '',
      contents: normalizeContentsToRepeater([], parsed?.content),
      author: fm.author || '',
      role: fm.role || '',
      authorImage: null,
      authorImageAlt: '',
      pubDate: normalizeCosmicDate(fm.pubDate),
      cardImage,
      cardImageAlt: fm.cardImageAlt || '',
      readTime: typeof fm.readTime === 'number' ? fm.readTime : Number(fm.readTime || 0),
      tags: Array.isArray(fm.tags) ? fm.tags.map((t) => ({ tag: String(t) })) : [],
      category: 'insights'
    }

    if (!metadata.pubDate) delete metadata.pubDate
    if (!metadata.cardImage) delete metadata.cardImage

    await upsertObject(cosmicClient, 'posts', slug, metadata, metadata.title)
  }
}

loadEnvFromFile()

const BUCKET = process.env.PUBLIC_COSMIC_BUCKET_SLUG || process.env.COSMIC_BUCKET_SLUG
const READ_KEY = process.env.PUBLIC_COSMIC_READ_KEY || process.env.COSMIC_READ_KEY || ''
const WRITE_KEY = process.env.COSMIC_WRITE_KEY || ''

if (!BUCKET) {
  console.error('❌ Missing COSMIC bucket slug. Set PUBLIC_COSMIC_BUCKET_SLUG or COSMIC_BUCKET_SLUG in .env')
  process.exit(1)
}
if (!WRITE_KEY) {
  console.error('❌ Missing COSMIC write key. Set COSMIC_WRITE_KEY in .env (you need write access to create types/objects)')
  process.exit(1)
}

console.log('🚀 Provisioning Cosmic bucket:', BUCKET)

const cosmic = createBucketClient({ bucketSlug: BUCKET, readKey: READ_KEY, writeKey: WRITE_KEY })

async function ensureType(slug, title, _metafields) {
  try {
    await cosmic.objectTypes.insertOne({ title, slug })
    console.log(`✅ Created type: ${slug}`)
  } catch (err) {
    const msg = err?.message || ''
    if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('duplicate')) {
      console.log(`✓ Type exists: ${slug}`)
      return
    }
    console.warn(`⚠️  Could not create type '${slug}': ${msg}`)
  }
}

async function ensureObject(type, slug, metadata, title) {
  try {
    // Idempotency: check if object already exists
    try {
      const existing = await cosmic.objects.findOne({ type, slug }).props('id')
      if (existing && existing.object) {
        console.log(`✓ Object exists: ${type}/${slug}`)
        return
      }
    } catch (_) {}

    await cosmic.objects.insertOne({
      type,
      slug,
      title: title || slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      status: 'published',
      metadata
    })
    console.log(`✅ Created object: ${type}/${slug}`)
  } catch (err) {
    const msg = err?.message || ''
    if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('duplicate')) {
      console.log(`✓ Object exists: ${type}/${slug}`)
      return
    }
    console.warn(`⚠️  Could not create object '${type}/${slug}': ${msg}`)
  }
}

function readJson(rel) {
  return JSON.parse(fs.readFileSync(join(__dirname, rel), 'utf8'))
}

// Load local fallback JSON to seed
const heroJson = readJson('./src/content/homepage/hero.json')
const clientsJson = readJson('./src/content/homepage/clients.json')
const featuresGeneralJson = readJson('./src/content/homepage/features-general.json')
const featuresTabsJson = readJson('./src/content/homepage/features-tabs.json')
const testimonialsJson = readJson('./src/content/homepage/testimonials.json')
const faqJson = readJson('./src/content/homepage/faq.json')
const ctaJson = readJson('./src/content/homepage/cta.json')

const aboutJson = readJson('./src/content/pages/about.json')
const servicesJson = readJson('./src/content/pages/services.json')
const contactJson = readJson('./src/content/pages/contact.json')

// Metafields definitions
const navMetafields = [
  { type: 'repeater', title: 'Links', key: 'links', repeater_fields: [
    { type: 'text', title: 'Name', key: 'name' },
    { type: 'text', title: 'URL', key: 'url' }
  ]},
  { type: 'file', title: 'Logo', key: 'logo' }
]

const footerMetafields = [
  { type: 'repeater', title: 'Sections', key: 'sections', repeater_fields: [
    { type: 'text', title: 'Section', key: 'section' },
    { type: 'repeater', title: 'Links', key: 'links', repeater_fields: [
      { type: 'text', title: 'Name', key: 'name' },
      { type: 'text', title: 'URL', key: 'url' }
    ]}
  ]},
  { type: 'object', title: 'Social Links', key: 'socialLinks', object_fields: [
    { type: 'text', title: 'Facebook', key: 'facebook' },
    { type: 'text', title: 'Instagram', key: 'instagram' },
    { type: 'text', title: 'LinkedIn', key: 'linkedin' },
    { type: 'text', title: 'Twitter', key: 'twitter' }
  ]},
  { type: 'text', title: 'Newsletter Title', key: 'newsletterTitle' },
  { type: 'textarea', title: 'Newsletter Content', key: 'newsletterContent' }
]

const heroMetafields = [
  { type: 'text', title: 'Title', key: 'title' },
  { type: 'textarea', title: 'Subtitle', key: 'subTitle' },
  { type: 'text', title: 'Primary Button', key: 'primaryBtn' },
  { type: 'text', title: 'Primary Button URL', key: 'primaryBtnURL' },
  { type: 'text', title: 'Secondary Button', key: 'secondaryBtn' },
  { type: 'text', title: 'Secondary Button URL', key: 'secondaryBtnURL' },
  { type: 'text', title: 'Video Source', key: 'videoSrc' },
  { type: 'text', title: 'Video Type', key: 'videoType' },
  { type: 'text', title: 'Video Alt', key: 'alt' }
]

const clientsMetafields = [
  { type: 'text', title: 'Title', key: 'title' },
  { type: 'textarea', title: 'Subtitle', key: 'subTitle' },
  { type: 'repeater', title: 'Partners', key: 'partners', repeater_fields: [
    { type: 'text', title: 'Name', key: 'name' },
    { type: 'file', title: 'Icon', key: 'icon' },
    { type: 'text', title: 'Link', key: 'href' }
  ]}
]

const featuresGeneralMetafields = [
  { type: 'text', title: 'Title', key: 'title' },
  { type: 'textarea', title: 'Subtitle', key: 'subTitle' },
  { type: 'file', title: 'Image', key: 'image' },
  { type: 'text', title: 'Image Alt', key: 'imageAlt' },
  { type: 'repeater', title: 'Features', key: 'features', repeater_fields: [
    { type: 'text', title: 'Heading', key: 'heading' },
    { type: 'textarea', title: 'Content', key: 'content' },
    { type: 'text', title: 'Icon', key: 'svg' }
  ]}
]

const featuresTabsMetafields = [
  { type: 'text', title: 'Title', key: 'title' },
  { type: 'repeater', title: 'Tabs', key: 'tabs', repeater_fields: [
    { type: 'text', title: 'Heading', key: 'heading' },
    { type: 'textarea', title: 'Content', key: 'content' },
    { type: 'text', title: 'Icon', key: 'svg' },
    { type: 'file', title: 'Image', key: 'src' },
    { type: 'text', title: 'Image Alt', key: 'alt' }
  ]}
]

const testimonialsMetafields = [
  { type: 'text', title: 'Title', key: 'title' },
  { type: 'textarea', title: 'Subtitle', key: 'subTitle' },
  { type: 'repeater', title: 'Testimonials', key: 'testimonials', repeater_fields: [
    { type: 'textarea', title: 'Content', key: 'content' },
    { type: 'text', title: 'Author', key: 'author' },
    { type: 'text', title: 'Role', key: 'role' },
    { type: 'file', title: 'Avatar', key: 'avatarSrc' },
    { type: 'text', title: 'Avatar Alt', key: 'avatarAlt' }
  ]},
  { type: 'repeater', title: 'Statistics', key: 'statistics', repeater_fields: [
    { type: 'text', title: 'Count', key: 'count' },
    { type: 'text', title: 'Description', key: 'description' }
  ]}
]

const faqMetafields = [
  { type: 'text', title: 'Title', key: 'title' },
  { type: 'object', title: 'FAQs', key: 'faqs', object_fields: [
    { type: 'textarea', title: 'Subtitle', key: 'subTitle' },
    { type: 'repeater', title: 'Questions', key: 'faqs', repeater_fields: [
      { type: 'text', title: 'Question', key: 'question' },
      { type: 'textarea', title: 'Answer', key: 'answer' }
    ]}
  ]}
]

const ctaMetafields = [
  { type: 'text', title: 'Title', key: 'title' },
  { type: 'textarea', title: 'Subtitle', key: 'subTitle' },
  { type: 'text', title: 'Button Label', key: 'buttonLabel' },
  { type: 'text', title: 'Button URL', key: 'url' }
]

const blogPageContentMetafields = [
  { type: 'text', title: 'Title', key: 'title' },
  { type: 'textarea', title: 'Subtitle', key: 'subTitle' },
  { type: 'text', title: 'Second Title', key: 'secondTitle' },
  { type: 'textarea', title: 'Second Subtitle', key: 'secondSubTitle' }
]

const postsMetafields = [
  { type: 'text', title: 'Title', key: 'title', required: true },
  { type: 'textarea', title: 'Description', key: 'description' },
  { type: 'repeater', title: 'Contents', key: 'contents', repeater_fields: [
    { type: 'textarea', title: 'Content', key: 'content' }
  ]},
  { type: 'text', title: 'Author', key: 'author' },
  { type: 'text', title: 'Role', key: 'role' },
  { type: 'text', title: 'Author Image URL', key: 'authorImage' },
  { type: 'text', title: 'Author Image Alt', key: 'authorImageAlt' },
  { type: 'text', title: 'Publish Date', key: 'pubDate' },
  { type: 'text', title: 'Card Image URL', key: 'cardImage' },
  { type: 'text', title: 'Card Image Alt', key: 'cardImageAlt' },
  { type: 'number', title: 'Read Time', key: 'readTime' },
  { type: 'repeater', title: 'Tags', key: 'tags', repeater_fields: [
    { type: 'text', title: 'Tag', key: 'tag' }
  ]},
  { type: 'text', title: 'Category', key: 'category' }
]

const aboutGalleryMetafields = [
  { type: 'repeater', title: 'Items', key: 'items', repeater_fields: [
    { type: 'text', title: 'Title', key: 'title' },
    { type: 'textarea', title: 'Description', key: 'description' },
    { type: 'file', title: 'Image', key: 'image' },
    { type: 'text', title: 'Alt', key: 'alt' },
    { type: 'text', title: 'Size', key: 'size' },
    { type: 'number', title: 'Order', key: 'order' },
    { type: 'text', title: 'URL', key: 'url' }
  ]}
]

const aboutMetafields = [
  { type: 'text', title: 'Title', key: 'title' },
  { type: 'textarea', title: 'Subtitle', key: 'subTitle' },
  { type: 'text', title: 'Gallery Title', key: 'galleryTitle' },
  { type: 'text', title: 'Features Title', key: 'featuresTitle' },
  { type: 'textarea', title: 'Features Subtitle', key: 'featuresSubTitle' },
  { type: 'repeater', title: 'Features Benefits', key: 'featuresBenefits', repeater_fields: [
    { type: 'text', title: 'Benefit', key: 'benefit' }
  ]},
  { type: 'text', title: 'Testimonials Title', key: 'testimonialsTitle' },
  { type: 'repeater', title: 'Testimonials', key: 'testimonials', repeater_fields: [
    { type: 'textarea', title: 'Content', key: 'content' },
    { type: 'text', title: 'Author', key: 'author' },
    { type: 'text', title: 'Role', key: 'role' },
    { type: 'text', title: 'Avatar URL', key: 'avatarSrc' },
    { type: 'text', title: 'Avatar Alt', key: 'avatarAlt' }
  ]}
]

const servicesMetafields = [
  { type: 'text', title: 'Main Section Title', key: 'mainSectionTitle' },
  { type: 'textarea', title: 'Main Section Subtitle', key: 'mainSectionSubTitle' },
  { type: 'text', title: 'Main Section Button Title', key: 'mainSectionBtnTitle' },
  { type: 'text', title: 'Main Section Button URL', key: 'mainSectionBtnURL' },
  { type: 'text', title: 'Services Intro Text', key: 'servicesIntro' },
  { type: 'repeater', title: 'Services', key: 'services', repeater_fields: [
    { type: 'text', title: 'Title', key: 'title' },
    { type: 'textarea', title: 'Subtitle', key: 'subTitle' },
    { type: 'text', title: 'Button Title', key: 'btnTitle' },
    { type: 'text', title: 'Button URL', key: 'btnURL' },
    { type: 'text', title: 'Image Path', key: 'img' },
    { type: 'text', title: 'Image Alt', key: 'imgAlt' },
    { type: 'text', title: 'Image One Path', key: 'imgOne' },
    { type: 'text', title: 'Image One Alt', key: 'imgOneAlt' }
  ]},
  { type: 'text', title: 'Stats Title', key: 'statsTitle' },
  { type: 'textarea', title: 'Stats Subtitle', key: 'statsSubTitle' },
  { type: 'text', title: 'Main Stat Title', key: 'mainStatTitle' },
  { type: 'text', title: 'Main Stat Subtitle', key: 'mainStatSubTitle' },
  { type: 'repeater', title: 'Stats', key: 'stats', repeater_fields: [
    { type: 'text', title: 'Stat Value', key: 'stat' },
    { type: 'text', title: 'Description', key: 'description' }
  ]}
]

const contactMetafields = [
  { type: 'text', title: 'Page Title', key: 'pageTitle' },
  { type: 'text', title: 'Title', key: 'title' },
  { type: 'textarea', title: 'Subtitle', key: 'subTitle' },
  { type: 'text', title: 'Form Title', key: 'formTitle' },
  { type: 'text', title: 'Form Subtitle', key: 'formSubTitle' },
  { type: 'text', title: 'Submit Button', key: 'submitButton' },
  { type: 'text', title: 'Contact Info Title', key: 'contactInfoTitle' },
  { type: 'repeater', title: 'Contact Info', key: 'contactInfo', repeater_fields: [
    { type: 'text', title: 'Icon', key: 'icon' },
    { type: 'text', title: 'Label', key: 'label' },
    { type: 'text', title: 'Value', key: 'value' }
  ]},
  { type: 'text', title: 'Social Title', key: 'socialTitle' },
  { type: 'repeater', title: 'Social Links', key: 'socialLinks', repeater_fields: [
    { type: 'text', title: 'Platform', key: 'platform' },
    { type: 'text', title: 'URL', key: 'url' }
  ]}
]

async function main() {
  console.log('📝 Creating object types...')
  await ensureType('navigation', 'Navigation', navMetafields)
  await ensureType('footer', 'Footer', footerMetafields)

  await ensureType('hero-content', 'Hero Content', heroMetafields)
  await ensureType('clients-content', 'Clients Content', clientsMetafields)
  await ensureType('features-general', 'Features General', featuresGeneralMetafields)
  await ensureType('features-tabs', 'Features Tabs', featuresTabsMetafields)
  await ensureType('testimonials', 'Testimonials', testimonialsMetafields)
  await ensureType('faq', 'FAQ', faqMetafields)
  await ensureType('cta', 'Call To Action', ctaMetafields)
  await ensureType('blog-content', 'Blog Page Content', blogPageContentMetafields)

  await ensureType('posts', 'Posts', postsMetafields)
  await ensureType('about-gallery', 'About Gallery', aboutGalleryMetafields)

  await ensureType('about-content', 'About Page Content', aboutMetafields)
  await ensureType('services-content', 'Services Page Content', servicesMetafields)
  await ensureType('contact-content', 'Contact Page Content', contactMetafields)

  console.log('⏳ Waiting briefly for types to be registered...')
  await new Promise((r) => setTimeout(r, 2000))

  console.log('\n📄 Seeding content objects...')
  await ensureObject('navigation', 'site-navigation', {
    links: [
      { name: 'Home', url: '/' },
      { name: 'Services', url: '/services' },
      { name: 'Blog', url: '/blog' },
      { name: 'About', url: '/about' },
      { name: 'Contact', url: '/contact' }
    ],
    logo: null
  })

  await ensureObject('footer', 'site-footer', {
    sections: [
      { section: 'Company', links: [ { name: 'About', url: '/about' }, { name: 'Services', url: '/services' } ] },
      { section: 'Resources', links: [ { name: 'Blog', url: '/blog' }, { name: 'Contact', url: '/contact' } ] }
    ],
    newsletterTitle: 'Stay updated',
    newsletterContent: 'Subscribe to our newsletter for updates.'
  })

  // Sanitize hero payload (remove boolean key that may not be supported by type)
  const { withReview, ...heroPayload } = heroJson
  // Map keys to match Cosmic metafield keys (lowercase)
  const heroPayloadMapped = {
    title: heroPayload.title,
    subtitle: heroPayload.subTitle,
    primarybtn: heroPayload.primaryBtn,
    primarybtnurl: heroPayload.primaryBtnURL,
    secondarybtn: heroPayload.secondaryBtn,
    secondarybtnurl: heroPayload.secondaryBtnURL,
    videosrc: heroPayload.videoSrc,
    videotype: heroPayload.videoType,
    alt: heroPayload.alt
  }
  await ensureObject('hero-content', 'homepage-hero', heroPayloadMapped)
  await ensureObject('clients-content', 'homepage-clients', clientsJson)
  await ensureObject('features-general', 'homepage-features-general', featuresGeneralJson)
  // Sanitize features-tabs payload (remove boolean keys in tabs)
  const featuresTabsPayload = {
    ...featuresTabsJson,
    tabs: Array.isArray(featuresTabsJson.tabs)
      ? featuresTabsJson.tabs.map(({ first, second, ...rest }) => rest)
      : []
  }
  await ensureObject('features-tabs', 'homepage-features-tabs', featuresTabsPayload)
  await ensureObject('testimonials', 'homepage-testimonials', testimonialsJson)
  // FAQ creation is handled later with shape detection fallbacks
  await ensureObject('cta', 'homepage-cta', ctaJson)

  await ensureObject('blog-content', 'blog-page', {
    title: 'StillCraft Blog',
    subTitle: 'Explore our blog for event planning tips, industry insights, and expert advice.',
    secondTitle: 'Insights',
    secondSubTitle: "Stay up-to-date with the latest trends with insights from our team of industry experts."
  })

  await ensureObject('about-gallery', 'about-gallery', { items: [] })

  // Sanitize About payload to match existing type metafields (omit ctaText/ctaUrl; normalize featuresBenefits)
  const aboutPayload = {
    title: aboutJson.title,
    subTitle: aboutJson.subTitle,
    galleryTitle: aboutJson.galleryTitle,
    featuresTitle: aboutJson.featuresTitle,
    featuresSubTitle: aboutJson.featuresSubTitle,
    featuresBenefits: Array.isArray(aboutJson.featuresBenefits)
      ? aboutJson.featuresBenefits.map((b) => (typeof b === 'string' ? { benefit: b } : b))
      : [],
    testimonialsTitle: aboutJson.testimonialsTitle,
    testimonials: Array.isArray(aboutJson.testimonials) ? aboutJson.testimonials : []
  }
  await ensureObject('about-content', 'about-page', aboutPayload)

  // Sanitize services payload to remove boolean keys that may not be in type
  const servicesPayload = {
    ...servicesJson,
    mainSectionBtnExists: undefined,
    services: Array.isArray(servicesJson.services)
      ? servicesJson.services.map(({ isRightSection, btnExists, single, ...rest }) => rest)
      : []
  }
  if (servicesPayload.mainSectionBtnExists === undefined) delete servicesPayload.mainSectionBtnExists
  await ensureObject('services-content', 'services-page', servicesPayload)

  // Sanitize Contact payload to avoid missing 'formFields' on existing type
  const { formFields, ...contactPayload } = contactJson
  await ensureObject('contact-content', 'contact-page', contactPayload)

  // Import real local posts (English only)
  await importLocalPostsEnglishOnly(cosmic)

  // FAQ object intentionally not pre-seeded to avoid schema conflicts; page will use JSON fallback until edited in CMS.

  console.log('\n🎉 Provisioning complete!')
  console.log('Next:')
  console.log('- Ensure .env has COSMIC_BUCKET_SLUG and COSMIC_READ_KEY set for this bucket')
  console.log('- Restart: npm run dev')
  console.log('- Visit the site and verify content renders from Cosmic')
}

main().catch((e) => {
  console.error('❌ Provisioning failed:', e?.message || e)
  process.exit(1)
})
