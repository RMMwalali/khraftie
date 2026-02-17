# Manual Cosmic CMS Setup Guide

## Quick Setup - 15 Minutes

Your website is already integrated with Cosmic CMS! Now you need to manually create the content types in your Cosmic dashboard.

### Step 1: Go to Your Cosmic Dashboard
1. Login to [cosmicjs.com](https://cosmicjs.com)
2. Select your bucket: `stillkraft-events-production`

### Step 2: Create Content Types

#### 1. Hero Content
- **Go to**: Your Bucket → Object Types → Add New
- **Settings**:
  - Title: `Hero Content`
  - Singular: `Hero Content`
  - Plural: `Hero Contents`
  - Slug: `hero-content`

- **Metafields** (click Add Metafield for each):
  1. **Title** - Type: Text, Key: `title`
  2. **Subtitle** - Type: Textarea, Key: `subTitle`
  3. **Primary Button** - Type: Text, Key: `primaryBtn`
  4. **Primary Button URL** - Type: Text, Key: `primaryBtnURL`
  5. **Secondary Button** - Type: Text, Key: `secondaryBtn`
  6. **Secondary Button URL** - Type: Text, Key: `secondaryBtnURL`
  7. **With Review** - Type: Toggle, Key: `withReview`
  8. **Video Source** - Type: Text, Key: `videoSrc`
  9. **Video Type** - Type: Text, Key: `videoType`
  10. **Video Alt** - Type: Text, Key: `alt`

#### 2. Clients Content
- **Settings**:
  - Title: `Clients Content`
  - Slug: `clients-content`

- **Metafields**:
  1. **Title** - Type: Text, Key: `title`
  2. **Subtitle** - Type: Textarea, Key: `subTitle`
  3. **Partners** - Type: Repeater, Key: `partners`
     - Inside Partners, add these sub-fields:
     - **Name** - Type: Text, Key: `name`
     - **Icon** - Type: File, Key: `icon`
     - **Link** - Type: Text, Key: `href`

#### 3. Features General
- **Settings**:
  - Title: `Features General`
  - Slug: `features-general`

- **Metafields**:
  1. **Title** - Type: Text, Key: `title`
  2. **Subtitle** - Type: Textarea, Key: `subTitle`
  3. **Image** - Type: File, Key: `image`
  4. **Image Alt** - Type: Text, Key: `imageAlt`
  5. **Features** - Type: Repeater, Key: `features`
     - Inside Features, add:
     - **Heading** - Type: Text, Key: `heading`
     - **Content** - Type: Textarea, Key: `content`
     - **Icon** - Type: Text, Key: `svg`

#### 4. Features Tabs
- **Settings**:
  - Title: `Features Tabs`
  - Slug: `features-tabs`

- **Metafields**:
  1. **Title** - Type: Text, Key: `title`
  2. **Tabs** - Type: Repeater, Key: `tabs`
     - Inside Tabs, add:
     - **Heading** - Type: Text, Key: `heading`
     - **Content** - Type: Textarea, Key: `content`
     - **Icon** - Type: Text, Key: `svg`
     - **Image** - Type: File, Key: `src`
     - **Image Alt** - Type: Text, Key: `alt`
     - **First Tab** - Type: Toggle, Key: `first`
     - **Second Style** - Type: Toggle, Key: `second`

#### 5. Testimonials
- **Settings**:
  - Title: `Testimonials`
  - Slug: `testimonials`

- **Metafields**:
  1. **Title** - Type: Text, Key: `title`
  2. **Subtitle** - Type: Textarea, Key: `subTitle`
  3. **Testimonials** - Type: Repeater, Key: `testimonials`
     - Inside Testimonials, add:
     - **Content** - Type: Textarea, Key: `content`
     - **Author** - Type: Text, Key: `author`
     - **Role** - Type: Text, Key: `role`
     - **Avatar** - Type: File, Key: `avatarSrc`
  4. **Statistics** - Type: Repeater, Key: `statistics`
     - Inside Statistics, add:
     - **Count** - Type: Text, Key: `count`
     - **Description** - Type: Text, Key: `description`

#### 6. FAQ
- **Settings**:
  - Title: `FAQ`
  - Slug: `faq`

- **Metafields**:
  1. **Title** - Type: Text, Key: `title`
  2. **FAQs** - Type: Object, Key: `faqs`
     - Inside FAQs, add:
     - **Subtitle** - Type: Textarea, Key: `subTitle`
     - **Questions** - Type: Repeater, Key: `faqs`
        - Inside Questions, add:
        - **Question** - Type: Text, Key: `question`
        - **Answer** - Type: Textarea, Key: `answer`

#### 7. Call To Action
- **Settings**:
  - Title: `Call To Action`
  - Slug: `cta`

- **Metafields**:
  1. **Title** - Type: Text, Key: `title`
  2. **Subtitle** - Type: Textarea, Key: `subTitle`
  3. **Button Label** - Type: Text, Key: `buttonLabel`
  4. **Button URL** - Type: Text, Key: `url`

### Step 3: Create Content Objects

After creating all content types, create one object for each:

1. **Hero Content Object**:
   - Go to Objects → Add New → Select "Hero Content"
   - Title: `Homepage Hero`
   - Slug: `homepage-hero`
   - Fill in the data from `src/content/homepage/hero.json`

2. **Clients Content Object**:
   - Go to Objects → Add New → Select "Clients Content"
   - Title: `Homepage Clients`
   - Slug: `homepage-clients`
   - Fill in the data from `src/content/homepage/clients.json`

3. **Features General Object**:
   - Go to Objects → Add New → Select "Features General"
   - Title: `Homepage Features General`
   - Slug: `homepage-features-general`
   - Fill in the data from `src/content/homepage/features-general.json`

4. **Features Tabs Object**:
   - Go to Objects → Add New → Select "Features Tabs"
   - Title: `Homepage Features Tabs`
   - Slug: `homepage-features-tabs`
   - Fill in the data from `src/content/homepage/features-tabs.json`

5. **Testimonials Object**:
   - Go to Objects → Add New → Select "Testimonials"
   - Title: `Homepage Testimonials`
   - Slug: `homepage-testimonials`
   - Fill in the data from `src/content/homepage/testimonials.json`

6. **FAQ Object**:
   - Go to Objects → Add New → Select "FAQ"
   - Title: `Homepage FAQ`
   - Slug: `homepage-faq`
   - Fill in the data from `src/content/homepage/faq.json`

7. **Call To Action Object**:
   - Go to Objects → Add New → Select "Call To Action"
   - Title: `Homepage CTA`
   - Slug: `homepage-cta`
   - Fill in the data from `src/content/homepage/cta.json`

### Step 4: Test Integration

1. Make sure your `.env` file contains:
```
PUBLIC_COSMIC_BUCKET_SLUG=stillkraft-events-production
PUBLIC_COSMIC_READ_KEY=soPC3eRur6rQbcOMJUMMLvYH63FShQ6jCsvsceoJRSwjr0DMiO
```

2. Restart your dev server: `npm run dev`

3. Visit http://localhost:4322 - your site should now be pulling data from Cosmic!

### Step 5: Start Editing!

Now you can edit any text, image, or content from your Cosmic dashboard:
- Go to Objects → Edit any object
- Changes appear instantly on your website
- No need to touch code or redeploy

## What's Editable?

✅ **All text content** - headings, paragraphs, buttons  
✅ **All images** - hero images, client logos, feature images  
✅ **All links** - button URLs, navigation links  
✅ **All structured data** - testimonials, FAQs, features  
✅ **All repeater content** - add/remove testimonials, features, etc.

## Support

If you need help:
- Check the browser console for any error messages
- Verify your content types match the exact field names above
- Make sure your object slugs match exactly (homepage-hero, homepage-clients, etc.)

Your Cosmic CMS integration is now complete! 🎉
