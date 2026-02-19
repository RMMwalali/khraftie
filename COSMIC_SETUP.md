# Cosmic CMS Integration Setup Guide

## Overview
Your SkillCraft Events website has been successfully integrated with Cosmic CMS! The integration includes:
- ✅ Cosmic SDK installed
- ✅ Fallback system using existing JSON files
- ✅ No UI/UX changes - everything works exactly the same
- ✅ Fast image loading and form functionality preserved

## Setup Instructions for Your Client

### 1. Create Cosmic Account
1. Go to [cosmicjs.com](https://cosmicjs.com) and create a free account
2. Create a new Bucket (project) - name it something like "SkillCraft Events"

### 2. Get API Keys
From your Cosmic dashboard:
1. Go to Settings → API Keys
2. Copy the **Bucket Slug** and **Read Key**

### 3. Configure Environment Variables
1. Copy `.env.example` to `.env` (if not exists)
2. Add your Cosmic credentials:
```
PUBLIC_COSMIC_BUCKET_SLUG=your-bucket-slug
PUBLIC_COSMIC_READ_KEY=your-read-key
```

### 4. Create Content Types in Cosmic

Create the following Object Types in your Cosmic dashboard:

#### Hero Content
- **Type**: `hero-content`
- **Slug**: `homepage-hero`
- **Metafields**:
  - `title` (Text)
  - `subTitle` (Text Area)
  - `primaryBtn` (Text)
  - `primaryBtnURL` (Text)
  - `secondaryBtn` (Text, optional)
  - `secondaryBtnURL` (Text, optional)
  - `withReview` (Toggle)
  - `videoSrc` (Text)
  - `videoType` (Text)
  - `alt` (Text)

#### Clients Content
- **Type**: `clients-content`
- **Slug**: `homepage-clients`
- **Metafields**:
  - `title` (Text)
  - `subTitle` (Text Area)
  - `partners` (Repeater)
    - `name` (Text)
    - `icon` (Image)
    - `href` (Text)

#### Features General
- **Type**: `features-general`
- **Slug**: `homepage-features-general`
- **Metafields**:
  - `title` (Text)
  - `subTitle` (Text Area)
  - `image` (Image)
  - `imageAlt` (Text)
  - `features` (Repeater)
    - `heading` (Text)
    - `content` (Text Area)
    - `svg` (Text)

#### Features Tabs
- **Type**: `features-tabs`
- **Slug**: `homepage-features-tabs`
- **Metafields**:
  - `title` (Text)
  - `tabs` (Repeater)
    - `heading` (Text)
    - `content` (Text Area)
    - `svg` (Text)
    - `src` (Image)
    - `alt` (Text)
    - `first` (Toggle)
    - `second` (Toggle)

#### Testimonials
- **Type**: `testimonials`
- **Slug**: `homepage-testimonials`
- **Metafields**:
  - `title` (Text)
  - `subTitle` (Text Area)
  - `testimonials` (Repeater)
    - `content` (Text Area)
    - `author` (Text)
    - `role` (Text)
    - `avatarSrc` (Image)
  - `statistics` (Repeater)
    - `count` (Text)
    - `description` (Text)

#### FAQ
- **Type**: `faq`
- **Slug**: `homepage-faq`
- **Metafields**:
  - `title` (Text)
  - `faqs` (Object)
    - `subTitle` (Text Area)
    - `faqs` (Repeater)
      - `question` (Text)
      - `answer` (Text Area)

#### CTA
- **Type**: `cta`
- **Slug**: `homepage-cta`
- **Metafields**:
  - `title` (Text)
  - `subTitle` (Text Area)
  - `buttonLabel` (Text)
  - `url` (Text)

#### About Page Content
- **Type**: `about-content`
- **Slug**: `about-page`
- **Metafields**:
  - `title` (Text)
  - `subTitle` (Text Area)
  - `ctaText` (Text)
  - `ctaUrl` (Text)
  - `galleryTitle` (Text)
  - `featuresTitle` (Text)
  - `featuresSubTitle` (Text Area)
  - `featuresBenefits` (Repeater)
    - `benefit` (Text)
  - `testimonialsTitle` (Text)
  - `testimonials` (Repeater)
    - `content` (Text Area)
    - `author` (Text)
    - `role` (Text)
    - `avatarSrc` (Image)
    - `avatarAlt` (Text)

#### Blog Page Content
- **Type**: `blog-content`
- **Slug**: `blog-page`
- **Metafields**:
  - `title` (Text)
  - `subTitle` (Text Area)
  - `secondTitle` (Text)
  - `secondSubTitle` (Text Area)

#### Blog Posts
- **Type**: `blog-posts`
- **Metafields**:
  - `title` (Text)
  - `description` (Text Area)
  - `author` (Text)
  - `pubDate` (Date)
  - `readTime` (Number)
  - `cardImage` (Image)
  - `cardImageAlt` (Text)
  - `contents` (Repeater)
    - `content` (Text Area)
  - `tags` (Repeater)
    - `tag` (Text)

### 5. Import Existing Content
Copy the content from the existing JSON files in `src/content/homepage/` and `src/content/pages/` into your Cosmic objects. For blog posts, you can import content from the markdown files in `src/content/blog/` and `src/content/insights/`.

## How It Works

### Fallback System
- If Cosmic credentials are missing or API fails, the site automatically uses JSON files
- No downtime or broken pages
- Seamless transition between JSON and Cosmic

### Content Updates
- Client can update content through Cosmic admin panel
- Changes appear immediately on the website
- No need to touch code or redeploy

### Performance
- Images continue to load fast (using existing CDN)
- Forms work exactly as before
- No performance impact from Cosmic integration

## Testing
1. Run `npm run dev` to test locally
2. Visit http://localhost:4322 to verify everything works
3. Check browser console for any Cosmic-related warnings
4. Test with and without Cosmic credentials

## Deployment
The integration works with any deployment platform (Vercel, Netlify, etc.). Just ensure the environment variables are set in your deployment settings.

## Support
- Cosmic Documentation: https://docs.cosmicjs.com
- Existing Decap CMS still available at `/cms` as backup
- JSON files remain as fallback and backup
