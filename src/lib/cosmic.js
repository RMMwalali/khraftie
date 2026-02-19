import { createBucketClient } from '@cosmicjs/sdk'

// Initialize Cosmic client
const cosmic = createBucketClient({
  bucketSlug: import.meta.env.PUBLIC_COSMIC_BUCKET_SLUG,
  readKey: import.meta.env.PUBLIC_COSMIC_READ_KEY
})

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
  const url = imageObj.url || imageObj.imgix_url || null
  
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
  return iconObj.url || iconObj.imgix_url || null
}

// Helper function to fetch with fallback
async function fetchWithFallback(cosmicQuery, fallbackData) {
  try {
    // Check if Cosmic credentials are available
    if (!import.meta.env.PUBLIC_COSMIC_BUCKET_SLUG || !import.meta.env.PUBLIC_COSMIC_READ_KEY) {
      console.warn('Cosmic credentials not found, using JSON fallback')
      return fallbackData
    }

    const data = await cosmicQuery()
    return data
  } catch (error) {
    const errorMessage = error?.message || 'Unknown error'
    
    // Provide specific guidance for common errors
    if (errorMessage.includes('No objects found') || errorMessage.includes('stillkraft-events-production')) {
      console.warn('Cosmic bucket not found or empty. Please check:')
      console.warn('1. Bucket slug is correct:', import.meta.env.PUBLIC_COSMIC_BUCKET_SLUG)
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

// Hero content
export async function getHeroContent() {
  return fetchWithFallback(
    async () => {
      const data = await cosmic.objects.findOne({
        type: 'hero-content',
        slug: 'homepage-hero'
      }).props('metadata')
      if (!data.object) {
        console.warn('Hero content not found in Cosmic, using JSON fallback')
        return heroJson
      }
      return data.object.metadata
    },
    heroJson
  )
}

// Clients content
export async function getClientsContent() {
  return fetchWithFallback(
    async () => {
      const data = await cosmic.objects.findOne({
        type: 'clients-content',
        slug: 'homepage-clients'
      }).props('metadata')
      if (!data.object) {
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
    async () => {
      const data = await cosmic.objects.findOne({
        type: 'features-general',
        slug: 'homepage-features-general'
      }).props('metadata')
      if (!data.object) {
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
    async () => {
      const data = await cosmic.objects.findOne({
        type: 'features-tabs',
        slug: 'homepage-features-tabs'
      }).props('metadata')
      if (!data.object) {
        console.warn('Features Tabs content not found in Cosmic, using JSON fallback')
        return featuresTabsJson
      }
      return data.object.metadata
    },
    featuresTabsJson
  )
}

// Testimonials content
export async function getTestimonialsContent() {
  return fetchWithFallback(
    async () => {
      const data = await cosmic.objects.findOne({
        type: 'testimonials',
        slug: 'homepage-testimonials'
      }).props('metadata')
      if (!data.object) {
        console.warn('Testimonials content not found in Cosmic, using JSON fallback')
        return testimonialsJson
      }
      return data.object.metadata
    },
    testimonialsJson
  )
}

// FAQ content
export async function getFAQContent() {
  return fetchWithFallback(
    async () => {
      const data = await cosmic.objects.findOne({
        type: 'faq',
        slug: 'homepage-faq'
      }).props('metadata')
      if (!data.object) {
        console.warn('FAQ content not found in Cosmic, using JSON fallback')
        return faqJson
      }
      return data.object.metadata
    },
    faqJson
  )
}

// CTA content
export async function getCTAContent() {
  return fetchWithFallback(
    async () => {
      const data = await cosmic.objects.findOne({
        type: 'cta',
        slug: 'homepage-cta'
      }).props('metadata')
      if (!data.object) {
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
    async () => {
      const data = await cosmic.objects.findOne({
        type: 'about-content',
        slug: 'about-page'
      }).props('metadata')
      if (!data.object) {
        console.warn('About content not found in Cosmic, using JSON fallback')
        return aboutJson
      }
      return data.object.metadata
    },
    aboutJson
  )
}

// Services page content
export async function getServicesContent() {
  return fetchWithFallback(
    async () => {
      const data = await cosmic.objects.findOne({
        type: 'services-content',
        slug: 'services-page'
      }).props('metadata')
      if (!data.object) {
        console.warn('Services content not found in Cosmic, using JSON fallback')
        return servicesJson
      }
      return data.object.metadata
    },
    servicesJson
  )
}

// Contact page content
export async function getContactContent() {
  return fetchWithFallback(
    async () => {
      const data = await cosmic.objects.findOne({
        type: 'contact-content',
        slug: 'contact-page'
      }).props('metadata')
      if (!data.object) {
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
    async () => {
      const data = await cosmic.objects.findOne({
        type: 'blog-content',
        slug: 'blog-page'
      }).props('metadata')
      if (!data.object) {
        console.warn('Blog content not found in Cosmic, using JSON fallback')
        return {
          title: "SkillCraft Blog",
          subTitle: "Explore our blog for event planning tips, industry insights, and expert advice. Our team of professionals is dedicated to providing you with the latest trends and best practices in the event industry. Whether you're planning a wedding, corporate event, or private party, our blog is your go-to resource for all things event-related. Join us as we share our knowledge and experience to help you create unforgettable events that leave a lasting impression.",
          secondTitle: "Insights",
          secondSubTitle: "Stay up-to-date with the latest trends and developments in the construction industry with insights from SkillCraft Events's team of industry experts."
        }
      }
      return data.object.metadata
    },
    {
      title: "SkillCraft Blog",
      subTitle: "Explore our blog for event planning tips, industry insights, and expert advice. Our team of professionals is dedicated to providing you with the latest trends and best practices in the event industry. Whether you're planning a wedding, corporate event, or private party, our blog is your go-to resource for all things event-related. Join us as we share our knowledge and experience to help you create unforgettable events that leave a lasting impression.",
      secondTitle: "Insights",
      secondSubTitle: "Stay up-to-date with the latest trends and developments in the construction industry with insights from SkillCraft Events's team of industry experts."
    }
  )
}

// Get all blog posts
export async function getBlogPosts() {
  return fetchWithFallback(
    async () => {
      const data = await cosmic.objects.find({
        type: 'blog-posts'
      }).props('metadata')
      if (!data.objects || data.objects.length === 0) {
        console.warn('Blog posts not found in Cosmic, using content collection fallback')
        return []
      }
      return data.objects.map(obj => obj.metadata)
    },
    []
  )
}

// Get single blog post by slug
export async function getBlogPost(slug) {
  return fetchWithFallback(
    async () => {
      const data = await cosmic.objects.findOne({
        type: 'blog-posts',
        slug: slug
      }).props('metadata')
      if (!data.object) {
        console.warn(`Blog post ${slug} not found in Cosmic, using content collection fallback`)
        return null
      }
      return data.object.metadata
    },
    null
  )
}
