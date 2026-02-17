import { createBucketClient } from '@cosmicjs/sdk'

// Initialize Cosmic client
const cosmic = createBucketClient({
  bucketSlug: 'stillkraft-events-production',
  readKey: 'soPC3eRur6rQbcOMJUMMLvYH63FShQ6jCsvsceoJRSwjr0DMiO',
  writeKey: '62qVYy309er3O9DXyDJLuZn9Ds2sRPPQEnRev3LcC0iSiNEzYg'
})

async function cleanupDuplicates() {
  console.log('🧹 Cleaning up duplicate Cosmic objects...\n')

  try {
    // Get all objects
    const allObjects = await cosmic.objects.find()
    
    if (!allObjects.objects || allObjects.objects.length === 0) {
      console.log('No objects found')
      return
    }

    // Find objects with random suffixes (indicating duplicates)
    // Clean slugs are like: homepage-cta
    // Duplicate slugs are like: homepage-cta-e53de600-0b34-11f1-9c6e-6de9769c5566
    const objectsToDelete = []
    const objectsToKeep = []

    allObjects.objects.forEach(obj => {
      // Check if slug has a UUID-like suffix (contains multiple dashes and looks random)
      const hasRandomSuffix = /-[a-f0-9]{8}-[0-9]{4}-[0-9]{4}-[0-9]{4}-[a-f0-9]{12}$/.test(obj.slug)
      
      if (hasRandomSuffix) {
        objectsToDelete.push(obj)
      } else {
        objectsToKeep.push(obj)
      }
    })

    console.log(`Found ${objectsToDelete.length} duplicate(s) to clean up`)
    console.log(`Keeping ${objectsToKeep.length} clean object(s)\n`)

    if (objectsToDelete.length === 0) {
      console.log('✅ No duplicates found! Your Cosmic CMS is clean.')
      return
    }

    // Show what will be deleted
    console.log('🗑️  OBJECTS TO DELETE:')
    console.log('=====================')
    objectsToDelete.forEach((obj, index) => {
      console.log(`${index + 1}. ${obj.title}`)
      console.log(`   Type: ${obj.type}`)
      console.log(`   Slug: ${obj.slug}`)
      console.log(`   ID: ${obj.id}`)
      console.log('')
    })

    // Show what will be kept
    console.log('\n✅ OBJECTS TO KEEP:')
    console.log('===================')
    objectsToKeep.forEach((obj, index) => {
      console.log(`${index + 1}. ${obj.title}`)
      console.log(`   Type: ${obj.type}`)
      console.log(`   Slug: ${obj.slug}`)
      console.log(`   ID: ${obj.id}`)
      console.log('')
    })

    // Delete duplicates
    console.log('\n🗑️  DELETING DUPLICATES...')
    console.log('=========================')

    for (const obj of objectsToDelete) {
      try {
        await cosmic.objects.deleteOne(obj.id)
        console.log(`✅ Deleted: ${obj.title} (${obj.slug})`)
      } catch (error) {
        console.error(`❌ Failed to delete ${obj.title}: ${error.message}`)
      }
    }

    console.log('\n🎉 CLEANUP COMPLETE!')
    console.log('=====================')
    console.log(`Deleted ${objectsToDelete.length} duplicate object(s)`)
    console.log(`Kept ${objectsToKeep.length} clean object(s)`)
    
    console.log('\n📋 NEXT STEPS:')
    console.log('=============')
    console.log('1. Go to Cosmic Dashboard → Objects')
    console.log('2. Verify only the clean objects remain')
    console.log('3. Edit content as needed in Cosmic dashboard')
    console.log('4. Your website will now pull from clean, single objects')

  } catch (error) {
    console.error('❌ Error cleaning up duplicates:', error.message)
  }
}

// Run the cleanup
cleanupDuplicates().catch(console.error)
