import { createBucketClient } from '@cosmicjs/sdk'

// Initialize Cosmic client
const cosmic = createBucketClient({
  bucketSlug: 'stillkraft-events-production',
  readKey: 'soPC3eRur6rQbcOMJUMMLvYH63FShQ6jCsvsceoJRSwjr0DMiO',
  writeKey: '62qVYy309er3O9DXyDJLuZn9Ds2sRPPQEnRev3LcC0iSiNEzYg'
})

async function auditCosmicObjects() {
  console.log('🔍 Auditing Cosmic CMS objects...\n')

  try {
    // Get all object types
    const objectTypes = await cosmic.objectTypes.find()
    console.log('📋 OBJECT TYPES:')
    console.log('=================')
    if (objectTypes.objects && objectTypes.objects.length > 0) {
      objectTypes.objects.forEach((type, index) => {
        console.log(`${index + 1}. ${type.title} (slug: ${type.slug})`)
      })
    } else {
      console.log('No object types found')
    }
    console.log('')

    // Get all objects
    const allObjects = await cosmic.objects.find()
    console.log('📦 ALL OBJECTS:')
    console.log('===============')
    
    if (allObjects.objects && allObjects.objects.length > 0) {
      // Group by type
      const objectsByType = {}
      const slugCounts = {}

      allObjects.objects.forEach(obj => {
        // Group by type
        if (!objectsByType[obj.type]) {
          objectsByType[obj.type] = []
        }
        objectsByType[obj.type].push(obj)

        // Count slugs
        if (!slugCounts[obj.slug]) {
          slugCounts[obj.slug] = []
        }
        slugCounts[obj.slug].push(obj)
      })

      // Display objects by type
      Object.keys(objectsByType).forEach(type => {
        console.log(`\n${type.toUpperCase()}:`)
        objectsByType[type].forEach(obj => {
          console.log(`  - ${obj.title} (slug: ${obj.slug}, id: ${obj.id})`)
        })
      })

      // Check for duplicates
      console.log('\n\n🔍 DUPLICATE CHECK:')
      console.log('===================')
      let hasDuplicates = false

      Object.keys(slugCounts).forEach(slug => {
        if (slugCounts[slug].length > 1) {
          hasDuplicates = true
          console.log(`\n⚠️  DUPLICATE FOUND: ${slug}`)
          slugCounts[slug].forEach(obj => {
            console.log(`   - ID: ${obj.id}, Title: ${obj.title}, Type: ${obj.type}`)
          })
        }
      })

      if (!hasDuplicates) {
        console.log('✅ No duplicates found!')
      }

      // Check for objects with same type and similar titles
      console.log('\n\n🔍 SIMILAR OBJECTS CHECK:')
      console.log('=========================')
      let hasSimilar = false

      Object.keys(objectsByType).forEach(type => {
        const typeObjects = objectsByType[type]
        if (typeObjects.length > 1) {
          hasSimilar = true
          console.log(`\n⚠️  Multiple objects of type "${type}":`)
          typeObjects.forEach(obj => {
            console.log(`   - ${obj.title} (slug: ${obj.slug}, id: ${obj.id})`)
          })
        }
      })

      if (!hasSimilar) {
        console.log('✅ No multiple objects of same type found')
      }

      // Summary
      console.log('\n\n📊 SUMMARY:')
      console.log('===========')
      console.log(`Total Object Types: ${objectTypes.objects ? objectTypes.objects.length : 0}`)
      console.log(`Total Objects: ${allObjects.objects.length}`)
      
      if (hasDuplicates || hasSimilar) {
        console.log('\n⚠️  Issues found that need attention')
      } else {
        console.log('\n✅ All objects look good!')
      }

    } else {
      console.log('No objects found in bucket')
    }

  } catch (error) {
    console.error('❌ Error auditing Cosmic objects:', error.message)
  }
}

// Run the audit
auditCosmicObjects().catch(console.error)
