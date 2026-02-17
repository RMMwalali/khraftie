import { createBucketClient } from '@cosmicjs/sdk'

// Initialize Cosmic client
const cosmic = createBucketClient({
  bucketSlug: 'stillkraft-events-production',
  readKey: 'soPC3eRur6rQbcOMJUMMLvYH63FShQ6jCsvsceoJRSwjr0DMiO',
  writeKey: '62qVYy309er3O9DXyDJLuZn9Ds2sRPPQEnRev3LcC0iSiNEzYg'
})

// Object IDs to delete (the ones with UUID suffixes)
const objectsToDelete = [
  // CTA duplicates
  '6993109bc3fe0b3f9019a874', // homepage-cta-e53de600-0b34-11f1-9c6e-6de9769c5566
  '69931048c3fe0b3f9019a870',  // homepage-cta-b39caaf0-0b34-11f1-9c6e-6de9769c5566
  
  // Testimonials duplicate
  '6993109ac3fe0b3f9019a873',  // homepage-testimonials-e437e7b0-0b34-11f1-9c6e-6de9769c5566
  
  // Features-General duplicate
  '69931098c3fe0b3f9019a872',  // homepage-features-general-e3457160-0b34-11f1-9c6e-6de9769c5566
  
  // Clients duplicate
  '69931097c3fe0b3f9019a871',  // homepage-clients-e295f780-0b34-11f1-9c6e-6de9769c5566
]

async function deleteSpecificObjects() {
  console.log('🗑️  Deleting duplicate Cosmic objects...\n')

  let deletedCount = 0
  let failedCount = 0

  for (const objectId of objectsToDelete) {
    try {
      await cosmic.objects.deleteOne(objectId)
      console.log(`✅ Deleted object ID: ${objectId}`)
      deletedCount++
    } catch (error) {
      console.error(`❌ Failed to delete ${objectId}: ${error.message}`)
      failedCount++
    }
  }

  console.log('\n🎉 CLEANUP COMPLETE!')
  console.log('=====================')
  console.log(`Successfully deleted: ${deletedCount} object(s)`)
  console.log(`Failed to delete: ${failedCount} object(s)`)
  
  console.log('\n📋 REMAINING OBJECTS (clean versions):')
  console.log('=======================================')
  console.log('✅ homepage-cta (id: 69930fe0c3fe0b3f9019a86c)')
  console.log('✅ homepage-testimonials (id: 69931047c3fe0b3f9019a86f)')
  console.log('✅ homepage-features-general (id: 69931045c3fe0b3f9019a86e)')
  console.log('✅ homepage-clients (id: 69931044c3fe0b3f9019a86d)')
  
  console.log('\n📝 Next Steps:')
  console.log('1. Run audit again: node audit-duplicates.mjs')
  console.log('2. Verify only 4 objects remain (one of each type)')
  console.log('3. Edit content in Cosmic dashboard as needed')
}

// Run the deletion
deleteSpecificObjects().catch(console.error)
