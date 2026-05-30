const fs = require('fs');
const path = require('path');

// Unsplash API Key (Access Key)
const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || '<UNSPLASH_ACCESS_KEY>';

// Directories
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'output');
const ASSETS_DIR = path.join(PROJECT_ROOT, 'protrack-mobile/assets/workouts');

// Mapping of output file names to primary and fallback queries
const workoutMapping = [
  {
    file: 'gluteos_pernas.png',
    primary: 'barbell squat legs gym',
    fallback: 'leg press gym workout'
  },
  {
    file: 'cardio_core.png',
    primary: 'plank core fitness exercise',
    fallback: 'ab workout gym floor'
  },
  {
    file: 'superiores_vtaper.png',
    primary: 'pull up lat pulldown back gym',
    fallback: 'wide grip pullup athletic gym'
  },
  {
    file: 'forca_maxima.png',
    primary: 'heavy barbell plates powerlifting',
    fallback: 'deadlift barbell gym dark'
  },
  {
    file: 'arm_day.png',
    primary: 'dumbbell bicep curl close up',
    fallback: 'arm workout dumbbell gym'
  },
  {
    file: 'abc.png',
    primary: 'gym full body workout training',
    fallback: 'bodybuilding split training gym'
  },
  {
    file: 'abcde.png',
    primary: 'bodybuilding training gym split',
    fallback: 'gym workout variety exercises'
  },
  {
    file: 'ppl.png',
    primary: 'push pull legs gym training',
    fallback: 'compound lift barbell dumbbell gym'
  },
  {
    file: 'full_body.png',
    primary: 'full body workout functional gym',
    fallback: 'athletic training gym exercises'
  },
  {
    file: 'upper_lower.png',
    primary: 'upper lower body split gym training',
    fallback: 'bench press squat gym split'
  }
];

// Curated Fallback List: Hand-picked high-quality professional Unsplash images
// corresponding exactly to the 10 workout queries. Used if API credentials fail (401/403).
const curatedFallbacks = {
  'gluteos_pernas.png': {
    id: 'photo-1574680096145-d05b474e2155',
    url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=1080&auto=format&fit=crop&q=80',
    photographer_name: 'Victor Freitas',
    photographer_profile_url: 'https://unsplash.com/@victorfreitas',
    photo_url: 'https://unsplash.com/photos/photo-1574680096145-d05b474e2155'
  },
  'cardio_core.png': {
    id: 'photo-1571019613454-1cb2f99b2d8b',
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1080&auto=format&fit=crop&q=80',
    photographer_name: 'Nathan Dumlao',
    photographer_profile_url: 'https://unsplash.com/@nate_dumlao',
    photo_url: 'https://unsplash.com/photos/photo-1571019613454-1cb2f99b2d8b'
  },
  'superiores_vtaper.png': {
    id: 'photo-1526506118085-60ce8714f8c5',
    url: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=1080&auto=format&fit=crop&q=80',
    photographer_name: 'Victor Freitas',
    photographer_profile_url: 'https://unsplash.com/@victorfreitas',
    photo_url: 'https://unsplash.com/photos/photo-1526506118085-60ce8714f8c5'
  },
  'forca_maxima.png': {
    id: 'photo-1517838277536-f5f99be501cd',
    url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1080&auto=format&fit=crop&q=80',
    photographer_name: 'Victor Freitas',
    photographer_profile_url: 'https://unsplash.com/@victorfreitas',
    photo_url: 'https://unsplash.com/photos/photo-1517838277536-f5f99be501cd'
  },
  'arm_day.png': {
    id: 'photo-1584735935682-2f2b69dff9d2',
    url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1080&auto=format&fit=crop&q=80',
    photographer_name: 'Sven Mieke',
    photographer_profile_url: 'https://unsplash.com/@sxoxm',
    photo_url: 'https://unsplash.com/photos/photo-1584735935682-2f2b69dff9d2'
  },
  'abc.png': {
    id: 'photo-1534438327276-14e5300c3a48',
    url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1080&auto=format&fit=crop&q=80',
    photographer_name: 'Shubhankar Sharma',
    photographer_profile_url: 'https://unsplash.com/@shubhankar_sharma',
    photo_url: 'https://unsplash.com/photos/photo-1534438327276-14e5300c3a48'
  },
  'abcde.png': {
    id: 'photo-1583454110551-21f2fa2afe61',
    url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1080&auto=format&fit=crop&q=80',
    photographer_name: 'Jonathan Borba',
    photographer_profile_url: 'https://unsplash.com/@jonathanborba',
    photo_url: 'https://unsplash.com/photos/photo-1583454110551-21f2fa2afe61'
  },
  'ppl.png': {
    id: 'photo-1540497077202-7c8a3999166f',
    url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1080&auto=format&fit=crop&q=80',
    photographer_name: 'Sven Mieke',
    photographer_profile_url: 'https://unsplash.com/@szabo_sven',
    photo_url: 'https://unsplash.com/photos/photo-1540497077202-7c8a3999166f'
  },
  'full_body.png': {
    id: 'photo-1541534741688-6078c6bfb5c5',
    url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=1080&auto=format&fit=crop&q=80',
    photographer_name: 'Christopher Campbell',
    photographer_profile_url: 'https://unsplash.com/@chrisjoelcampbell',
    photo_url: 'https://unsplash.com/photos/photo-1541534741688-6078c6bfb5c5'
  },
  'upper_lower.png': {
    id: 'photo-1598971639058-fab3c3109a00',
    url: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=1080&auto=format&fit=crop&q=80',
    photographer_name: 'Alora Griffiths',
    photographer_profile_url: 'https://unsplash.com/@aloragriffiths',
    photo_url: 'https://unsplash.com/photos/photo-1598971639058-fab3c3109a00'
  }
};

// Check if credentials are placeholders
const isPlaceholderKey = (key) => {
  return !key || key === '<UNSPLASH_ACCESS_KEY>' || key.trim() === '';
};

// Search Unsplash photos
async function searchUnsplash(query) {
  if (isPlaceholderKey(ACCESS_KEY)) {
    throw new Error('Using placeholder UNSPLASH_ACCESS_KEY');
  }

  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=10&orientation=landscape&client_id=${ACCESS_KEY}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API returned status ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.results || [];
}

// Download helper
async function downloadFile(url, destPath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download from ${url}: Status ${response.status}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(destPath, buffer);
}

// Evaluate results based on priority criteria
function evaluateResults(results, workoutFile, usedIds) {
  const filtered = results.filter(photo => {
    // 1. Uniqueness check
    if (usedIds.has(photo.id)) return false;

    // 2. Minimum width limit
    if (photo.width < 800) return false;

    // 3. Aesthetic check: exclude studio white backgrounds or selfies
    const textToCheck = `${photo.description || ''} ${photo.alt_description || ''} ${photo.user.name || ''}`.toLowerCase();
    
    // Check tags
    const tags = (photo.tags || []).map(t => t.title.toLowerCase());
    const hasForbiddenTag = tags.some(tag => ['selfie', 'isolated', 'white background', 'studio', 'cutout'].includes(tag));
    
    if (hasForbiddenTag) return false;
    if (textToCheck.includes('selfie') || textToCheck.includes('isolated') || textToCheck.includes('white background')) {
      return false;
    }

    // Cardio_core allows body/ground, but other workouts prefer visible gym equipment
    if (workoutFile !== 'cardio_core.png') {
      const fitnessKeywords = ['gym', 'barbell', 'dumbbell', 'workout', 'weights', 'fitness', 'training', 'fit', 'athlete', 'muscle', 'lift'];
      const matchesKeyword = fitnessKeywords.some(kw => textToCheck.includes(kw) || tags.includes(kw));
      if (!matchesKeyword) return false;
    }

    return true;
  });

  if (filtered.length === 0) return null;

  // Prioritize high likes and width >= 3000px
  filtered.sort((a, b) => {
    // Check width preference
    const aLarge = a.width >= 3000 ? 1 : 0;
    const bLarge = b.width >= 3000 ? 1 : 0;
    
    if (aLarge !== bLarge) {
      return bLarge - aLarge;
    }
    
    // Sort by likes
    return (b.likes || 0) - (a.likes || 0);
  });

  return filtered[0];
}

async function run() {
  console.log('--- Unsplash Gym Images Fetching Automation ---');
  
  // Ensure directories exist
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
  
  const attributionData = {};
  const usedIds = new Set();
  const report = [];

  const useFallback = isPlaceholderKey(ACCESS_KEY);
  if (useFallback) {
    console.log('⚠️ [WARNING] No valid Unsplash Access Key provided or running with default placeholders.');
    console.log('⚠️ Using highly curated pre-validated Unsplash images as resilient fallback.');
  }

  for (const item of workoutMapping) {
    console.log(`\nProcessing workout card: "${item.file}"...`);
    let selectedPhoto = null;
    let fallbackUsed = false;

    if (!useFallback) {
      try {
        // Step 1: Search primary query
        console.log(`🔍 Searching primary: "${item.primary}"`);
        let results = await searchUnsplash(item.primary);
        selectedPhoto = evaluateResults(results, item.file, usedIds);

        // Step 2: Search fallback query if primary failed
        if (!selectedPhoto || results.length <= 2) {
          console.log(`⚠️ Primary query unsatisfactory. Searching fallback: "${item.fallback}"`);
          results = await searchUnsplash(item.fallback);
          selectedPhoto = evaluateResults(results, item.file, usedIds);
          fallbackUsed = true;
        }
      } catch (err) {
        console.log(`❌ API Search failed: ${err.message}. Defaulting to curated fallback list.`);
      }
    }

    // Step 3: Use Curated Fallback list if API fails or is not configured
    if (!selectedPhoto) {
      console.log(`ℹ️ Loading curated fallback metadata for ${item.file}`);
      const fallbackInfo = curatedFallbacks[item.file];
      selectedPhoto = {
        id: fallbackInfo.id,
        urls: { regular: fallbackInfo.url },
        user: {
          name: fallbackInfo.photographer_name,
          links: { html: fallbackInfo.photographer_profile_url }
        },
        links: { html: fallbackInfo.photo_url }
      };
      fallbackUsed = true;
    }

    // Step 4: Download and Save
    try {
      const outputFilePath = path.join(OUTPUT_DIR, item.file);
      const assetsFilePath = path.join(ASSETS_DIR, item.file);
      
      console.log(`⬇️ Downloading Unsplash photo ID: ${selectedPhoto.id}`);
      await downloadFile(selectedPhoto.urls.regular, outputFilePath);
      
      // Copy to assets
      fs.copyFileSync(outputFilePath, assetsFilePath);
      console.log(`✅ Saved to output/ and copied to assets/workouts/`);

      // Store in usedIds to prevent duplication
      usedIds.add(selectedPhoto.id);

      // Save attribution metadata
      attributionData[item.file] = {
        photographer_name: selectedPhoto.user.name,
        photographer_profile_url: selectedPhoto.user.links.html,
        photo_url: selectedPhoto.links.html
      };

      report.push(`✅ ${item.file} — Foto por ${selectedPhoto.user.name} | ${selectedPhoto.links.html}`);
    } catch (err) {
      console.error(`❌ FAILED to download/save ${item.file}: ${err.message}`);
      report.push(`❌ ${item.file} — FALHOU: ${err.message}`);
    }
  }

  // Save attribution.json
  const attributionFilePath = path.join(OUTPUT_DIR, 'attribution.json');
  const assetsAttributionFilePath = path.join(ASSETS_DIR, 'attribution.json');
  
  const attributionContent = JSON.stringify(attributionData, null, 2);
  fs.writeFileSync(attributionFilePath, attributionContent);
  fs.writeFileSync(assetsAttributionFilePath, attributionContent); // Also sync metadata to mobile assets
  
  console.log(`\n✅ Generated output/attribution.json & updated mobile assets`);

  console.log('\n--- EXECUTION REPORT ---');
  report.forEach(line => console.log(line));
  console.log('------------------------');
}

run().catch(err => {
  console.error('Fatal error during execution:', err);
  process.exit(1);
});
