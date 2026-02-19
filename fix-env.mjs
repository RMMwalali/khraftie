import fs from 'fs'

// Read current .env file
const envContent = fs.readFileSync('.env', 'utf8')

// Fix line breaks and format
const fixedEnv = `# Cosmic CMS Configuration
PUBLIC_COSMIC_BUCKET_SLUG=stillkraft-events-production
PUBLIC_COSMIC_READ_KEY=soPC3eRur6rQbcOMJUMMLvYH63FShQ6jCsvsceoJRSwjr0DMiO
`

// Write fixed .env file
fs.writeFileSync('.env', fixedEnv)

console.log('✅ .env file fixed!')
console.log('Bucket Slug: stillkraft-events-production')
console.log('Read Key: [REDACTED]')

// Test Cosmic connection
import { createBucketClient } from '@cosmicjs/sdk'

const cosmic = createBucketClient({
  bucketSlug: 'stillkraft-events-production',
  readKey: 'soPC3eRur6rQbcOMJUMMLvYH63FShQ6jCsvsceoJRSwjr0DMiO'
})

console.log('🔍 Testing Cosmic connection...')

try {
  const data = await cosmic.objects.findOne({
    type: 'clients-content',
    slug: 'homepage-clients'
  }).props('metadata')
  
  if (data.object) {
    console.log('✅ Cosmic connection successful!')
    console.log('Found clients content:', data.object.metadata)
  } else {
    console.log('⚠️  Clients content not found in Cosmic')
  }
} catch (error) {
  console.error('❌ Cosmic connection failed:', error.message)
  
  if (error.message.includes('No objects found')) {
    console.log('\n🔧 SOLUTION: Create content types in Cosmic dashboard:')
    console.log('1. Go to your Cosmic bucket')
    console.log('2. Create Object Type: clients-content')
    console.log('3. Create Object with slug: homepage-clients')
    console.log('4. Add partners array with icon and name fields')
  }
}
