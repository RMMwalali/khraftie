import { createBucketClient } from '@cosmicjs/sdk'

// Test Cosmic configuration
console.log('Testing Cosmic Configuration...')
console.log('Bucket Slug:', import.meta.env.PUBLIC_COSMIC_BUCKET_SLUG)
console.log('Read Key:', import.meta.env.PUBLIC_COSMIC_READ_KEY ? '✓ Set' : '✗ Missing')

if (!import.meta.env.PUBLIC_COSMIC_BUCKET_SLUG || !import.meta.env.PUBLIC_COSMIC_READ_KEY) {
  console.error('❌ Cosmic credentials not found in environment variables')
  console.log('Please check your .env file contains:')
  console.log('PUBLIC_COSMIC_BUCKET_SLUG=your-bucket-slug')
  console.log('PUBLIC_COSMIC_READ_KEY=your-read-key')
  process.exit(1)
}

try {
  const cosmic = createBucketClient({
    bucketSlug: import.meta.env.PUBLIC_COSMIC_BUCKET_SLUG,
    readKey: import.meta.env.PUBLIC_COSMIC_READ_KEY
  })

  console.log('✓ Cosmic client initialized')
  console.log('🔍 Testing bucket access...')
  
  // Test basic bucket access
  const objects = await cosmic.objects.find()
  console.log(`✓ Found ${objects.objects.length} objects in bucket`)
  
  if (objects.objects.length === 0) {
    console.warn('⚠️  Bucket is empty - you need to create content types and add content')
  } else {
    console.log('✓ Bucket access successful')
  }
  
} catch (error) {
  console.error('❌ Cosmic connection failed:', error.message)
  
  if (error.message.includes('No objects found')) {
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Check bucket slug is correct:', import.meta.env.PUBLIC_COSMIC_BUCKET_SLUG)
    console.log('2. Verify bucket exists in Cosmic dashboard')
    console.log('3. Ensure content types are created')
  }
  
  if (error.message.includes('401') || error.message.includes('403')) {
    console.log('\n🔧 Authentication issue:')
    console.log('1. Verify read key is valid')
    console.log('2. Regenerate read key if needed')
  }
}
