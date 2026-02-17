import { createBucketClient } from '@cosmicjs/sdk'

// Initialize Cosmic client
const cosmic = createBucketClient({
  bucketSlug: 'stillkraft-events-production',
  readKey: 'soPC3eRur6rQbcOMJUMMLvYH63FShQ6jCsvsceoJRSwjr0DMiO',
  writeKey: '62qVYy309er3O9DXyDJLuZn9Ds2sRPPQEnRev3LcC0iSiNEzYg'
})

async function auditCosmicObjects() {
  console.log('🔍 Auditing Cosmic CMS for duplicates...\n')

  try {
    // Get all objects
    const allObjects = await cosmic.objects.find()
    
    if (!allObjects.objects || allObjects.objects.length === 0) {
      console.log('No objects found in bucket')
      return
    }

    console.log(`Total objects found: ${allObjects.objects.length}\n`)

    // Group objects by type
    const objectsByType = {}
    const slugOccurrences = {}

    allObjects.objects.forEach(obj => {
      // Group by type
      if (!objectsByType[obj.type]) {
        objectsByType[obj.type] = []
      }
      objectsByType[obj.type].push(obj)

      // Track slug occurrences
      if (!slugOccurrences[obj.slug]) {
        slugOccurrences[obj.slug] = []
      }
      slugOccurrences[obj.slug].push(obj)
    })

    // Display all objects by type
    console.log('📦 OBJECTS BY TYPE:')
    console.log('===================')
    Object.keys(objectsByType).forEach(type => {
      console.log(`\n${type}:`)
      objectsByType[type].forEach(obj => {
        console.log(`  - ${obj.title}`)
        console.log(`    slug: ${obj.slug}`)
        console.log(`    id: ${obj.id}`)
        console.log('')
      })
    })

    // Check for duplicate slugs
    console.log('\n\n🔍 DUPLICATE CHECK:')
    console.log('===================')
    let foundDuplicates = false

    Object.keys(slugOccurrences).forEach(slug => {
      if (slugOccurrences[slug].length > 1) {
        foundDuplicates = true
        console.log(`\n⚠️  DUPLICATE SLUG: "${slug}"`)
        console.log('   Objects with this slug:')
        slugOccurrences[slug].forEach((obj, index) => {
          console.log(`   ${index + 1}. ${obj.title} (type: ${obj.type}, id: ${obj.id})`)
        })
      }
    })

    // Check for similar titles (potential duplicates)
    console.log('\n\n🔍 SIMILAR TITLES CHECK:')
    console.log('========================')
    let foundSimilar = false

    Object.keys(objectsByType).forEach(type => {
      const typeObjects = objectsByType[type]
      if (typeObjects.length > 1) {
        // Check if titles are similar (case insensitive comparison)
        const titleGroups = {}
        
        typeObjects.forEach(obj => {
          const normalizedTitle = obj.title.toLowerCase().trim()
          if (!titleGroups[normalizedTitle]) {
            titleGroups[normalizedTitle] = []
          }
          titleGroups[normalizedTitle].push(obj)
        })

        Object.keys(titleGroups).forEach(title => {
          if (titleGroups[title].length > 1) {
            foundSimilar = true
            console.log(`\n⚠️  SIMILAR TITLES in type "${type}":`)
            console.log('   Title variations:')
            titleGroups[title].forEach((obj, index) => {
              console.log(`   ${index + 1}. "${obj.title}" (slug: ${obj.slug}, id: ${obj.id})`)
            })
          }
        })
      }
    })

    // Summary
    console.log('\n\n📊 SUMMARY:')
    console.log('===========')
    
    if (!foundDuplicates && !foundSimilar) {
      console.log('✅ No duplicates found! All objects are unique.')
    } else {
      if (foundDuplicates) {
        console.log('⚠️  Duplicate slugs found - these need to be cleaned up')
      }
      if (foundSimilar) {
        console.log('⚠️  Similar titles found - verify these are intentional')
      }
    }

    console.log('\n📋 RECOMMENDED ACTIONS:')
    console.log('=======================')
    
    if (foundDuplicates || foundSimilar) {
      console.log('1. Go to Cosmic Dashboard → Objects')
      console.log('2. Review the duplicate/similar objects listed above')
      console.log('3. Delete duplicates keeping only one version')
      console.log('4. Ensure remaining objects have accurate content')
    } else {
      console.log('✅ Your Cosmic CMS is clean and well-organized!')
    }

    console.log('\n📝 Current Object Count by Type:')
    Object.keys(objectsByType).forEach(type => {
      console.log(`  ${type}: ${objectsByType[type].length} object(s)`)
    })

  } catch (error) {
    console.error('❌ Error auditing Cosmic objects:', error.message)
  }
}

// Run the audit
auditCosmicObjects().catch(console.error)
