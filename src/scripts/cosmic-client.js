// Client-side Cosmic CMS integration
export async function fetchCosmicContent(type, slug) {
  const response = await fetch(`https://api.cosmicjs.com/v3/buckets/${import.meta.env.PUBLIC_COSMIC_BUCKET_SLUG}/objects/${slug}?read_key=${import.meta.env.PUBLIC_COSMIC_READ_KEY}`);
  
  if (!response.ok) {
    console.warn('Cosmic fetch failed, using fallback');
    return null;
  }
  
  return await response.json();
}

// Update content dynamically
export async function updatePageContent() {
  // Example: Update hero content
  const heroData = await fetchCosmicContent('hero-content', 'homepage-hero');
  if (heroData) {
    // Update DOM elements
    const heroTitle = document.querySelector('[data-cosmic="hero-title"]');
    if (heroTitle) heroTitle.textContent = heroData.object.metadata.title;
  }
}
