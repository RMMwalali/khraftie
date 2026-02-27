import { createBucketClient } from '@cosmicjs/sdk'

// Resolve env vars (prefer PUBLIC_*, fallback to private COSMIC_* so users can keep their naming)
const PUBLIC_BUCKET = import.meta.env.PUBLIC_COSMIC_BUCKET_SLUG
const PRIVATE_BUCKET = import.meta.env.COSMIC_BUCKET_SLUG
const PUBLIC_READ = import.meta.env.PUBLIC_COSMIC_READ_KEY
const PRIVATE_READ = import.meta.env.COSMIC_READ_KEY

const BUCKET_SLUG = PUBLIC_BUCKET || PRIVATE_BUCKET
const READ_KEY = PUBLIC_READ || PRIVATE_READ

// Initialize Cosmic client lazily (avoids build-time env capture issues on some deploy targets)
function getCosmicClient() {
  const bucketSlug = import.meta.env.PUBLIC_COSMIC_BUCKET_SLUG || import.meta.env.COSMIC_BUCKET_SLUG
  const readKey = import.meta.env.PUBLIC_COSMIC_READ_KEY || import.meta.env.COSMIC_READ_KEY
  return createBucketClient({ bucketSlug, readKey })
}

// Import JSON fallbacks
import heroJson from '../content/homepage/hero.json'
import clientsJson from '../content/homepage/clients.json'
import featuresGeneralJson from '../content/homepage/features-general.json'
import featuresTabsJson from '../content/homepage/features-tabs.json'
import testimonialsJson from '../content/homepage/testimonials.json'
import faqJson from '../content/homepage/faq.json'
import ctaJson from '../content/homepage/cta.json'

// Import page content JSON files
import aboutJson from '../content/pages/about.json'
import servicesJson from '../content/pages/services.json'
import contactJson from '../content/pages/contact.json'

// Helper function to extract image URL from Cosmic image object
function getImageUrl(imageObj) {
  if (!imageObj) return null
  if (typeof imageObj === 'string') return imageObj
  const url =
    imageObj.url ||
    imageObj.imgix_url ||
    imageObj?.media?.url ||
    imageObj?.media?.imgix_url ||
    imageObj?.image?.url ||
    imageObj?.image?.imgix_url ||
    null
  
  // For feature.jpg specifically, use local path since Cosmic URL returns 403
  if (url && url.includes('feature.jpg')) {
    return '/uploads/feature.jpg'
  }
  
  if (url && url.includes('//uploads/')) {
    // Fix double slash issue in Cosmic URLs
    return url.replace('//uploads/', '/uploads/')
  }
  return url
}

// Helper function to extract icon URL from Cosmic icon object
function getIconUrl(iconObj) {
  if (!iconObj) return null
  if (typeof iconObj === 'string') return iconObj

  // Handle common Cosmic media shapes
  const url =
    iconObj.url ||
    iconObj.imgix_url ||
    iconObj?.media?.url ||
    iconObj?.media?.imgix_url ||
    iconObj?.image?.url ||
    iconObj?.image?.imgix_url ||
    null

  if (typeof url === 'string' && url.length > 0) {
    if (url.startsWith('//')) return `https:${url}`
    return url
  }

  // Some Cosmic uploads may only provide a name/key; don't guess a URL.
  return null
}

// Helper function to fetch with fallback
async function fetchWithFallback(cosmicQuery, fallbackData) {
  try {
    // Check if Cosmic credentials are available
    if (!BUCKET_SLUG || !READ_KEY) {
      console.warn('Cosmic credentials not found, using JSON fallback')
      return fallbackData
    }

    // Safe diagnostics (never logs keys)
    if (import.meta.env.PROD) {
      console.warn('[cosmic] prod fetch attempt', {
        hasBucket: Boolean(BUCKET_SLUG),
        hasReadKey: Boolean(READ_KEY),
        bucketSlug: BUCKET_SLUG || null,
      })
    }

    const cosmic = getCosmicClient()
    const data = await cosmicQuery(cosmic)
    return data
  } catch (error) {
    const errorMessage = error?.message || 'Unknown error'
    
    // Provide specific guidance for common errors
    if (errorMessage.includes('No objects found') || errorMessage.includes('stillkraft-events-production')) {
      console.warn('Cosmic bucket not found or empty. Please check:')
      console.warn('1. Bucket slug is correct:', BUCKET_SLUG)
      console.warn('2. Read key is valid')
      console.warn('3. Bucket exists in Cosmic dashboard')
      console.warn('4. Content types are created in bucket')
    } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
      console.warn('Cosmic authentication failed. Please check your read key is valid')
    } else if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('network')) {
      console.warn('Network error - check your connection and bucket URL')
    }
    
    console.warn('Cosmic fetch failed, using JSON fallback:', errorMessage)
    return fallbackData
  }
}

// Graceful wrappers that don't throw on common "not found" cases
async function safeFind(params, cosmicClient) {
  try {
    const cosmic = cosmicClient || getCosmicClient()
    const data = await cosmic.objects.find(params).props('slug,id,metadata')
    return data
  } catch (err) {
    const msg = err?.message || ''
    if (msg.toLowerCase().includes('no objects found') || msg.toLowerCase().includes('not found')) {
      return { objects: [] }
    }
    return { objects: [] }
  }
}

async function safeFindOne(params, cosmicClient) {
  try {
    const cosmic = cosmicClient || getCosmicClient()
    const data = await cosmic.objects.findOne(params).props('slug,id,metadata')
    return data
  } catch (err) {
    const msg = err?.message || ''
    if (msg.toLowerCase().includes('no objects found') || msg.toLowerCase().includes('not found')) {
      return { object: null }
    }
    return { object: null }
  }
}

export function normalizeCosmicPost(post) {
  if (!post) return null
  const rawContents = post?.metadata?.contents
  const contents = Array.isArray(rawContents)
    ? rawContents
        .map((c) => {
          if (typeof c === 'string') return c
          if (c && typeof c === 'object') return c.content ?? c.text ?? ''
          return ''
        })
        .filter(Boolean)
    : []

  const rawTags = post?.metadata?.tags
  const tags = Array.isArray(rawTags)
    ? rawTags
        .map((t) => {
          if (typeof t === 'string') return t
          if (t && typeof t === 'object') return t.tag ?? t.name ?? ''
          return ''
        })
        .filter(Boolean)
    : []

  return {
    slug: post?.slug,
    title: post?.metadata?.title || "",
    description: post?.metadata?.description || "",
    contents,
    author: post?.metadata?.author || "",
    role: post?.metadata?.role || "",
    authorImage: getImageUrl(post?.metadata?.authorImage) || null,
    authorImageAlt: post?.metadata?.authorImageAlt || "",
    pubDate: post?.metadata?.pubDate ? new Date(post.metadata.pubDate) : null,
    cardImage: getImageUrl(post?.metadata?.cardImage) || null,
    cardImageAlt: post?.metadata?.cardImageAlt || "",
    readTime: Number(post?.metadata?.readTime || 0),
    tags,
    category: post?.metadata?.category || "",
  }
}

export async function getPosts(options = {}) {
  const { category } = options
  return fetchWithFallback(
    async (cosmic) => {
      // Prefer unified 'posts' type
      const data = await safeFind({ type: 'posts' }, cosmic)
      if (data.objects && data.objects.length > 0) {
        let posts = data.objects
        if (category) {
          posts = posts.filter((obj) => (obj?.metadata?.category || '').toLowerCase() === String(category).toLowerCase())
        }
        return posts.map((obj) => normalizeCosmicPost(obj))
      }

      // Fallback to legacy 'blog-posts' type (treated as category 'blog')
      const legacy = await safeFind({ type: 'blog-posts' }, cosmic)
      if (!legacy.objects || legacy.objects.length === 0) return []
      let posts = legacy.objects.map((obj) => ({ ...normalizeCosmicPost(obj), category: 'blog' }))
      if (category && String(category).toLowerCase() !== 'blog') {
        posts = []
      }
      return posts
    },
    []
  )
}

export async function getPost(slug) {
  return fetchWithFallback(
    async (cosmic) => {
      const data = await safeFindOne({ type: 'posts', slug }, cosmic)
      if (data.object) return normalizeCosmicPost(data.object)

      // Fallback to legacy 'blog-posts'
      const legacy = await safeFindOne({ type: 'blog-posts', slug }, cosmic)
      if (!legacy.object) return null
      return { ...normalizeCosmicPost(legacy.object), category: 'blog' }
    },
    null
  )
}

// About page gallery content
export async function getAboutGallery() {
  return fetchWithFallback(
    async (cosmic) => {
      let data = await safeFindOne({ type: 'about-gallery', slug: 'about-gallery' }, cosmic)
      if (!data.object) {
        const list = await safeFind({ type: 'about-gallery' }, cosmic)
        if (Array.isArray(list.objects) && list.objects.length > 0) {
          data = { object: list.objects[0] }
        }
      }
      if (!data.object) return []
      const md = data.object.metadata || {}
      const items = Array.isArray(md.items)
        ? md.items
            .map((it) => ({
              title: it?.title || '',
              description: it?.description || '',
              imageUrl: getImageUrl(it?.image) || null,
              size: (it?.size || 'small').toLowerCase(),
              order: Number(it?.order || 0),
              url: it?.url || null,
              alt: it?.alt || '',
            }))
            .filter((it) => it.imageUrl)
        : []
      return items.sort((a, b) => a.order - b.order)
    },
    []
  )
}

// Hero content
export async function getHeroContent() {
  return fetchWithFallback(
    async (cosmic) => {
      const data = await safeFindOne({ type: 'hero-content', slug: 'homepage-hero' }, cosmic)
      if (!data.object) {
        // fallback: get first object of this type
        const list = await safeFind({ type: 'hero-content' }, cosmic)
        if (Array.isArray(list.objects) && list.objects.length > 0) {
          return list.objects[0].metadata
        }
        console.warn('Hero content not found in Cosmic, using JSON fallback')
        return heroJson
      }
      const md = data.object.metadata || {}
      // Map Cosmic lowercase keys to component-expected camelCase keys
      return {
        title: md.title,
        subTitle: md.subtitle,
        primaryBtn: md.primarybtn,
        primaryBtnURL: md.primarybtnurl,
        secondaryBtn: md.secondarybtn,
        secondaryBtnURL: md.secondarybtnurl,
        videoSrc: md.videosrc,
        videoType: md.videotype,
        alt: md.alt
      }
    },
    heroJson
  )
}

// Clients content
export async function getClientsContent() {
  return fetchWithFallback(
    async (cosmic) => {
      const data = await safeFindOne({ type: 'clients-content', slug: 'homepage-clients' }, cosmic)
      if (!data.object) {
        const list = await safeFind({ type: 'clients-content' }, cosmic)
        if (Array.isArray(list.objects) && list.objects.length > 0) {
          const metadata = list.objects[0].metadata
          if (metadata.partners && Array.isArray(metadata.partners)) {
            metadata.partners = metadata.partners.map(partner => ({ ...partner, icon: getIconUrl(partner.icon) }))
          }
          return metadata
        }
        console.warn('Clients content not found in Cosmic, using JSON fallback')
        return clientsJson
      }
      const metadata = data.object.metadata
      // Transform partner icons to match component expectations
      if (metadata.partners && Array.isArray(metadata.partners)) {
        metadata.partners = metadata.partners.map(partner => ({
          ...partner,
          icon: getIconUrl(partner.icon)
        }))
      }
      return metadata
    },
    clientsJson
  )
}

// Features General content
export async function getFeaturesGeneralContent() {
  return fetchWithFallback(
    async (cosmic) => {
      const data = await safeFindOne({ type: 'features-general', slug: 'homepage-features-general' }, cosmic)
      if (!data.object) {
        const list = await safeFind({ type: 'features-general' }, cosmic)
        if (Array.isArray(list.objects) && list.objects.length > 0) {
          const metadata = list.objects[0].metadata
          if (metadata.image) {
            metadata.src = getImageUrl(metadata.image)
            delete metadata.image
          }
          return metadata
        }
        console.warn('Features General content not found in Cosmic, using JSON fallback')
        return featuresGeneralJson
      }
      const metadata = data.object.metadata
      // Transform image to match component expectations
      if (metadata.image) {
        metadata.src = getImageUrl(metadata.image)
        delete metadata.image // Remove the old image object
      }
      return metadata
    },
    featuresGeneralJson
  )
}

// Features Tabs content
export async function getFeaturesTabsContent() {
  return fetchWithFallback(
    async (cosmic) => {
      const data = await safeFindOne({ type: 'features-tabs', slug: 'homepage-features-tabs' }, cosmic)
      if (!data.object) {
        const list = await safeFind({ type: 'features-tabs' }, cosmic)
        if (Array.isArray(list.objects) && list.objects.length > 0) {
          const md = list.objects[0].metadata || {}
          const rawTabs = Array.isArray(md.tabs) ? md.tabs : []
          const hasExplicitFirst = rawTabs.some((t) => t?.first === true)
          const tabs = rawTabs.map((t, index) => {
            const src = getImageUrl(t?.src ?? t?.image) || t?.src || null
            const heading = t?.heading || ''
            return {
              ...t,
              src,
              alt: t?.alt || heading,
              first: hasExplicitFirst ? t?.first : index === 0,
            }
          })
          return { ...md, tabs }
        }
        console.warn('Features Tabs content not found in Cosmic, using JSON fallback')
        return featuresTabsJson
      }
      const md = data.object.metadata || {}
      const rawTabs = Array.isArray(md.tabs) ? md.tabs : []
      const hasExplicitFirst = rawTabs.some((t) => t?.first === true)
      const tabs = rawTabs.map((t, index) => {
        const src = getImageUrl(t?.src ?? t?.image) || t?.src || null
        const heading = t?.heading || ''
        return {
          ...t,
          src,
          alt: t?.alt || heading,
          first: hasExplicitFirst ? t?.first : index === 0,
        }
      })
      return { ...md, tabs }
    },
    featuresTabsJson
  )
}

// Testimonials content
export async function getTestimonialsContent() {
  return fetchWithFallback(
    async (cosmic) => {
      const data = await safeFindOne({ type: 'testimonials', slug: 'homepage-testimonials' }, cosmic)
      if (!data.object) {
        const list = await safeFind({ type: 'testimonials' }, cosmic)
        if (Array.isArray(list.objects) && list.objects.length > 0) {
          const md = list.objects[0].metadata || {}
          const raw = Array.isArray(md.testimonials) ? md.testimonials : []
          const testimonials = raw.map((t) => {
            const src = getImageUrl(t?.avatarSrc ?? t?.avatar ?? t?.image) || t?.avatarSrc || null
            const author = t?.author || ''
            const role = t?.role || ''
            return {
              ...t,
              avatarSrc: src,
              avatarAlt: t?.avatarAlt || (author && role ? `${author} - ${role}` : author || 'Testimonial avatar'),
            }
          })
          return { ...md, testimonials }
        }
        console.warn('Testimonials content not found in Cosmic, using JSON fallback')
        return testimonialsJson
      }
      const md = data.object.metadata || {}
      const raw = Array.isArray(md.testimonials) ? md.testimonials : []
      const testimonials = raw.map((t) => {
        const src = getImageUrl(t?.avatarSrc ?? t?.avatar ?? t?.image) || t?.avatarSrc || null
        const author = t?.author || ''
        const role = t?.role || ''
        return {
          ...t,
          avatarSrc: src,
          avatarAlt: t?.avatarAlt || (author && role ? `${author} - ${role}` : author || 'Testimonial avatar'),
        }
      })
      return { ...md, testimonials }
    },
    testimonialsJson
  )
}

// FAQ content
export async function getFAQContent() {
  return fetchWithFallback(
    async (cosmic) => {
      let data = await safeFindOne({ type: 'faq', slug: 'homepage-faq' }, cosmic)
      if (!data.object) {
        const list = await safeFind({ type: 'faq' }, cosmic)
        if (Array.isArray(list.objects) && list.objects.length > 0) {
          data = { object: list.objects[0] }
        }
      }
      if (!data.object) {
        console.warn('FAQ content not found in Cosmic, using JSON fallback')
        return faqJson
      }

      const md = data.object.metadata || {}
      const rawGroup = Array.isArray(md?.faqs)
        ? { faqs: md.faqs, subTitle: md?.subTitle ?? md?.subtitle }
        : md?.faqs && typeof md.faqs === 'object'
          ? md.faqs
          : md
      const rawList =
        Array.isArray(rawGroup?.faqs)
          ? rawGroup.faqs
          : Array.isArray(rawGroup?.items)
            ? rawGroup.items
            : rawGroup && typeof rawGroup === 'object'
              ? [rawGroup]
              : []

      const faqsList = rawList
        .map((it) => {
          if (!it || typeof it !== 'object') return null
          const question = it.question ?? it.title ?? it.q ?? ''
          const answer = it.answer ?? it.content ?? it.a ?? ''
          if (!question || !answer) return null
          return { question, answer }
        })
        .filter(Boolean)

      return {
        title: md?.title ?? faqJson?.title ?? '',
        faqs: {
          subTitle: rawGroup?.subTitle ?? rawGroup?.subtitle ?? md?.subTitle ?? md?.subtitle ?? faqJson?.faqs?.subTitle ?? '',
          faqs: faqsList,
        },
      }
    },
    faqJson
  )
}

// CTA content
export async function getCTAContent() {
  return fetchWithFallback(
    async (cosmic) => {
      // Primary type
      let data = await safeFindOne({ type: 'cta', slug: 'homepage-cta' }, cosmic)
      if (!data.object) {
        // Try alternate naming used in your bucket
        data = await safeFindOne({ type: 'call-to-action', slug: 'homepage-cta' }, cosmic)
      }
      if (!data.object) {
        const list = await safeFind({ type: 'cta' }, cosmic)
        if (Array.isArray(list.objects) && list.objects.length > 0) {
          return list.objects[0].metadata
        }
        const listAlt = await safeFind({ type: 'call-to-action' }, cosmic)
        if (Array.isArray(listAlt.objects) && listAlt.objects.length > 0) {
          return listAlt.objects[0].metadata
        }
        console.warn('CTA content not found in Cosmic, using JSON fallback')
        return ctaJson
      }
      return data.object.metadata
    },
    ctaJson
  )
}

// About page content
export async function getAboutContent() {
  return fetchWithFallback(
    async (cosmic) => {
      // Primary type
      let data = await safeFindOne({ type: 'about-content', slug: 'about-page' }, cosmic)
      if (!data.object) {
        // Try alternate naming used in your bucket
        data = await safeFindOne({ type: 'about-page-content', slug: 'about-page' }, cosmic)
      }
      if (!data.object) {
        const list = await safeFind({ type: 'about-content' }, cosmic)
        if (Array.isArray(list.objects) && list.objects.length > 0) {
          return list.objects[0].metadata
        }
        const listAlt = await safeFind({ type: 'about-page-content' }, cosmic)
        if (Array.isArray(listAlt.objects) && listAlt.objects.length > 0) {
          return listAlt.objects[0].metadata
        }
        console.warn('About content not found in Cosmic, using JSON fallback')
        return aboutJson
      }
      const md = data.object.metadata || {}

      const ctaText =
        md?.ctaText ??
        md?.cta_text ??
        md?.ctaTitle ??
        aboutJson?.ctaText ??
        ''
      const ctaUrl = md?.ctaUrl ?? md?.cta_url ?? md?.ctaURL ?? aboutJson?.ctaUrl ?? '#'

      const rawBenefits = md.featuresBenefits
      const featuresBenefits = Array.isArray(rawBenefits)
        ? rawBenefits
            .map((b) => {
              if (typeof b === 'string') return b
              if (b && typeof b === 'object') return b.benefit ?? b.text ?? b.content ?? ''
              return ''
            })
            .filter(Boolean)
        : []

      return {
        ...md,
        ctaText,
        ctaUrl,
        featuresBenefits,
      }
    },
    aboutJson
  )
}

// Services page content
export async function getServicesContent() {
  return fetchWithFallback(
    async (cosmic) => {
      // Primary type
      let data = await safeFindOne({ type: 'services-content', slug: 'services-page' }, cosmic)
      if (!data.object) {
        // Try alternate naming used in your bucket
        data = await safeFindOne({ type: 'services-page-content', slug: 'services-page' }, cosmic)
      }
      if (!data.object) {
        const list = await safeFind({ type: 'services-content' }, cosmic)
        if (Array.isArray(list.objects) && list.objects.length > 0) {
          return list.objects[0].metadata
        }
        const listAlt = await safeFind({ type: 'services-page-content' }, cosmic)
        if (Array.isArray(listAlt.objects) && listAlt.objects.length > 0) {
          return listAlt.objects[0].metadata
        }
        console.warn('Services content not found in Cosmic, using JSON fallback')
        return servicesJson
      }
      const md = data.object.metadata || {}
      // Cosmic keys are already camelCase, no mapping needed
      const mapped = {
        mainSectionTitle: md.mainSectionTitle,
        mainSectionSubTitle: md.mainSectionSubTitle,
        mainSectionBtnExists: md.mainSectionBtnExists,
        mainSectionBtnTitle: md.mainSectionBtnTitle,
        mainSectionBtnURL: md.mainSectionBtnURL,
        servicesIntro: md.servicesIntro,
        services: Array.isArray(md.services) ? md.services.map((service, index) => ({
          isRightSection: index % 2 === 1, // Every odd-indexed service (2nd, 4th, 6th) goes on the right
          title: service.title,
          subTitle: service.subTitle,
          single: service.single !== false, // Default to true unless explicitly false
          img: service.img,
          imgAlt: service.imgAlt,
          imgOne: service.imgOne,
          imgOneAlt: service.imgOneAlt,
          imgTwo: service.imgTwo,
          imgTwoAlt: service.imgTwoAlt,
          btnExists: service.btnExists,
          btnTitle: service.btnTitle,
          btnURL: service.btnURL
        })) : [],
        statsTitle: md.statsTitle,
        statsSubTitle: md.statsSubTitle,
        mainStatTitle: md.mainStatTitle,
        mainStatSubTitle: md.mainStatSubTitle,
        stats: Array.isArray(md.stats) ? md.stats : []
      }
      return mapped
    },
    servicesJson
  )
}

// Contact page content
export async function getContactContent() {
  return fetchWithFallback(
    async (cosmic) => {
      // Primary type
      let data = await safeFindOne({ type: 'contact-content', slug: 'contact-page' }, cosmic)
      if (!data.object) {
        // Try alternate naming used in your bucket
        data = await safeFindOne({ type: 'contact-page-content', slug: 'contact-page' }, cosmic)
      }
      if (!data.object) {
        const list = await safeFind({ type: 'contact-content' }, cosmic)
        if (Array.isArray(list.objects) && list.objects.length > 0) {
          return list.objects[0].metadata
        }
        const listAlt = await safeFind({ type: 'contact-page-content' }, cosmic)
        if (Array.isArray(listAlt.objects) && listAlt.objects.length > 0) {
          return listAlt.objects[0].metadata
        }
        console.warn('Contact content not found in Cosmic, using JSON fallback')
        return contactJson
      }
      return data.object.metadata
    },
    contactJson
  )
}

// Blog page content
export async function getBlogContent() {
  return fetchWithFallback(
    async (cosmic) => {
      // Primary type
      let data = await safeFindOne({ type: 'blog-content', slug: 'blog-page' }, cosmic)
      if (!data.object) {
        // Try alternate naming used in your bucket
        data = await safeFindOne({ type: 'blog-page-content', slug: 'blog-page' }, cosmic)
      }
      if (!data.object) {
        const list = await safeFind({ type: 'blog-content' }, cosmic)
        if (Array.isArray(list.objects) && list.objects.length > 0) {
          return list.objects[0].metadata
        }
        const listAlt = await safeFind({ type: 'blog-page-content' }, cosmic)
        if (Array.isArray(listAlt.objects) && listAlt.objects.length > 0) {
          return listAlt.objects[0].metadata
        }
        console.warn('Blog content not found in Cosmic, using JSON fallback')
        return {
          title: "StillCraft Blog",
          subTitle: "Explore our blog for event planning tips, industry insights, and expert advice. Our team of professionals is dedicated to providing you with the latest trends and best practices in the event industry. Whether you're planning a wedding, corporate event, or private party, our blog is your go-to resource for all things event-related. Join us as we share our knowledge and experience to help you create unforgettable events that leave a lasting impression.",
          secondTitle: "Insights",
          secondSubTitle: "Stay up-to-date with the latest trends and developments in the construction industry with insights from StillCraft Events's team of industry experts."
        }
      }
      return data.object.metadata
    },
    {
      title: "StillCraft Blog",
      subTitle: "Explore our blog for event planning tips, industry insights, and expert advice. Our team of professionals is dedicated to providing you with the latest trends and best practices in the event industry. Whether you're planning a wedding, corporate event, or private party, our blog is your go-to resource for all things event-related. Join us as we share our knowledge and experience to help you create unforgettable events that leave a lasting impression.",
      secondTitle: "Insights",
      secondSubTitle: "Stay up-to-date with the latest trends and developments in the construction industry with insights from StillCraft Events's team of industry experts."
    }
  )
}

// Get single blog post by slug
export async function getBlogPost(slug) {
  return fetchWithFallback(
    async (cosmic) => {
      const data = await safeFindOne({ type: 'blog-posts', slug: slug }, cosmic)
      if (!data.object) {
        console.warn(`Blog post ${slug} not found in Cosmic, using content collection fallback`)
        return null
      }
      return {
        slug: data.object.slug,
        title: data?.object?.metadata?.title,
        description: data?.object?.metadata?.description,
        contents: data?.object?.metadata?.contents,
        author: data?.object?.metadata?.author,
        role: data?.object?.metadata?.role,
        authorImage: getImageUrl(data?.object?.metadata?.authorImage),
        authorImageAlt: data?.object?.metadata?.authorImageAlt,
        pubDate: data?.object?.metadata?.pubDate,
        cardImage: getImageUrl(data?.object?.metadata?.cardImage),
        cardImageAlt: data?.object?.metadata?.cardImageAlt,
        readTime: data?.object?.metadata?.readTime,
        tags: data?.object?.metadata?.tags,
      }
    },
    null
  )
}

export function normalizeCosmicBlogPost(post) {
  if (!post) return null
  return {
    slug: post.slug,
    title: post.title || "",
    description: post.description || "",
    contents: Array.isArray(post.contents) ? post.contents : [],
    author: post.author || "",
    role: post.role || "",
    authorImage: post.authorImage || null,
    authorImageAlt: post.authorImageAlt || "",
    pubDate: post.pubDate ? new Date(post.pubDate) : null,
    cardImage: post.cardImage || null,
    cardImageAlt: post.cardImageAlt || "",
    readTime: Number(post.readTime || 0),
    tags: Array.isArray(post.tags) ? post.tags : [],
  }
}

// Navigation content (site-wide)
export async function getNavContent() {
  return fetchWithFallback(
    async (cosmic) => {
      const data = await safeFindOne({ type: 'navigation', slug: 'site-navigation' }, cosmic)
      if (!data.object) {
        console.warn('Navigation content not found in Cosmic')
        return { links: [], logoUrl: null }
      }
      const md = data.object.metadata || {}
      const links = Array.isArray(md.links)
        ? md.links
            .map((l) => ({ name: l?.name || '', url: l?.url || '#' }))
            .filter((l) => l.name && l.url)
        : []
      const logoUrl = getImageUrl(md.logo)
      return { links, logoUrl }
    },
    { links: [], logoUrl: null }
  )
}

// Footer content (site-wide)
export async function getFooterContent() {
  return fetchWithFallback(
    async (cosmic) => {
      const data = await safeFindOne({ type: 'footer', slug: 'site-footer' }, cosmic)
      if (!data.object) {
        console.warn('Footer content not found in Cosmic')
        return { sections: [], socialLinks: {}, newsletterTitle: null, newsletterContent: null }
      }
      const md = data.object.metadata || {}
      const sections = Array.isArray(md.sections)
        ? md.sections.map((s) => ({
            section: s?.section || '',
            links: Array.isArray(s?.links)
              ? s.links
                  .map((l) => ({ name: l?.name || '', url: l?.url || '#' }))
                  .filter((l) => l.name && l.url)
              : [],
          }))
        : []
      const socialLinks = {
        facebook: md?.socialLinks?.facebook || null,
        instagram: md?.socialLinks?.instagram || null,
        linkedin: md?.socialLinks?.linkedin || null,
        twitter: md?.socialLinks?.twitter || null,
      }
      const newsletterTitle = md?.newsletterTitle || null
      const newsletterContent = md?.newsletterContent || null
      return { sections, socialLinks, newsletterTitle, newsletterContent }
    },
    { sections: [], socialLinks: {}, newsletterTitle: null, newsletterContent: null }
  )
}
