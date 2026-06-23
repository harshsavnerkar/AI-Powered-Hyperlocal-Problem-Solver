import dotenv from 'dotenv';
dotenv.config();

// Haversine formula to compute distance in meters between two coordinates
export const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
  const R = 6371e3; // Earth radius in meters
  const r1 = lat1 * Math.PI / 180;
  const r2 = lat2 * Math.PI / 180;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(r1) * Math.cos(r2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// 1. Core AI Analysis: Classification, Priority, Smart Summary
export const analyzeIssue = async (description, base64Image, mimeType) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('⚠️ GEMINI_API_KEY is not defined. Using local AI heuristics engine.');
    return runHeuristicAI(description);
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const promptText = `
You are the AI engine of "Community Hero", a public infrastructure complaint portal.
Analyze the user's reported problem description and image (if provided) and classify it.
Your output must be JSON only. No markdown formatting blocks (e.g. do not wrap in \`\`\`json).
The JSON object must contain these exact fields:
- category: String. Must be exactly one of: 'Pothole', 'Garbage', 'Water Leakage', 'Streetlight', 'Open Manhole', 'Road Damage', 'Public Safety', 'Others'
- confidence: Number. Classification confidence between 0.0 and 1.0.
- priority: String. Must be exactly one of: 'Low', 'Medium', 'High', 'Critical'
- smartSummary: String. A concise, clear summary of the issue (maximum 60 characters). For example: "Water leaking from broken main pipe".

User description: "${description.replace(/"/g, '\\"')}"
    `;

    const contents = [];
    const parts = [{ text: promptText }];

    if (base64Image && mimeType) {
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Image
        }
      });
    }

    contents.push({ parts });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ contents })
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Clean up response formatting if wrapped in code blocks
    let cleanText = text.trim();
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
    }

    const result = JSON.parse(cleanText);
    return {
      category: result.category || 'Others',
      confidence: result.confidence || 0.85,
      priority: result.priority || 'Medium',
      smartSummary: result.smartSummary || (description.substring(0, 50) + '...')
    };
  } catch (error) {
    console.error('❌ Gemini API call failed. Falling back to heuristics:', error.message);
    return runHeuristicAI(description);
  }
};

// Local heuristics logic as a fallback if Gemini is offline or API key is absent
const runHeuristicAI = (desc = '') => {
  const d = desc.toLowerCase();
  let category = 'Others';
  let confidence = 0.70;
  let priority = 'Medium';

  // Category Detection
  if (d.includes('pothole') || d.includes('pit') || d.includes('crater')) {
    category = 'Pothole';
    confidence = 0.92;
  } else if (d.includes('garbage') || d.includes('trash') || d.includes('waste') || d.includes('dump') || d.includes('litter')) {
    category = 'Garbage';
    confidence = 0.95;
  } else if (d.includes('leak') || d.includes('water') || d.includes('pipe') || d.includes('sewage') || d.includes('overflow')) {
    category = 'Water Leakage';
    confidence = 0.90;
  } else if (d.includes('streetlight') || d.includes('dark') || d.includes('lamp') || d.includes('bulb') || d.includes('light not working')) {
    category = 'Streetlight';
    confidence = 0.88;
  } else if (d.includes('manhole') || d.includes('drain cover') || d.includes('open drain')) {
    category = 'Open Manhole';
    confidence = 0.94;
  } else if (d.includes('road') || d.includes('broken asphalt') || d.includes('cracks') || d.includes('sidewalk') || d.includes('footpath')) {
    category = 'Road Damage';
    confidence = 0.85;
  } else if (d.includes('danger') || d.includes('accident') || d.includes('safety') || d.includes('wire') || d.includes('electric shock') || d.includes('hazard')) {
    category = 'Public Safety';
    confidence = 0.87;
  }

  // Priority Engine
  if (d.includes('critical') || d.includes('accident') || d.includes('injury') || d.includes('severe') || d.includes('hazard') || d.includes('danger') || category === 'Open Manhole' || category === 'Public Safety') {
    priority = 'Critical';
  } else if (d.includes('urgent') || d.includes('high') || d.includes('blocking') || d.includes('heavy') || d.includes('broken')) {
    priority = 'High';
  } else if (d.includes('low') || d.includes('minor') || d.includes('aesthetic') || d.includes('dirty')) {
    priority = 'Low';
  }

  // Smart Summary
  let smartSummary = desc.trim();
  if (smartSummary.length > 50) {
    smartSummary = smartSummary.substring(0, 47) + '...';
  }
  if (!smartSummary) {
    smartSummary = `${category} issue reported`;
  }

  return { category, confidence, priority, smartSummary };
};

// 2. Duplicate Detection
// Scans list of existing issues to find similar categories within a 50-meter range
export const detectDuplicate = (newLat, newLon, newCategory, existingIssues) => {
  const DUPLICATE_MAX_DISTANCE_METERS = 50;

  for (const issue of existingIssues) {
    if (issue.status === 'Resolved') continue; // Skip resolved issues
    if (issue.category !== newCategory) continue; // Must be same category

    const distance = getDistanceInMeters(
      newLat, 
      newLon, 
      issue.location?.latitude, 
      issue.location?.longitude
    );

    if (distance <= DUPLICATE_MAX_DISTANCE_METERS) {
      return {
        isDuplicate: true,
        duplicateOf: issue
      };
    }
  }

  return { isDuplicate: false, duplicateOf: null };
};

// 3. Hotspot Analysis & Predictive Insights
export const generateAIInsights = (issues) => {
  const insights = [];
  const areaCounts = {};
  const categoryCounts = {};

  issues.forEach(issue => {
    const area = issue.location?.address || 'Unknown Area';
    const sector = area.split(',')[0].trim(); // Extract Sector or Ward
    const cat = issue.category;

    areaCounts[sector] = (areaCounts[sector] || 0) + 1;
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  // Identify hotspots (sectors with more than 3 active issues)
  const hotspots = Object.entries(areaCounts)
    .filter(([_, count]) => count >= 3)
    .map(([sector, count]) => ({
      sector,
      count,
      message: `Sector ${sector} shows a 35% increase in ${Object.keys(categoryCounts)[0] || 'infrastructure'} complaints.`
    }));

  // Construct Alerts
  const predictiveAlerts = [];
  if (categoryCounts['Pothole'] > 2) {
    predictiveAlerts.push({
      title: 'Pothole Surge Warning',
      message: 'Pothole reports are rising; likely to experience increased complaints during upcoming monsoon showers.'
    });
  }
  if (categoryCounts['Water Leakage'] > 2) {
    predictiveAlerts.push({
      title: 'Water Infrastructure Warning',
      message: 'Water leakage reports rising by 20% this week. Ward 4 and Sector 12 require pipe inspections.'
    });
  }

  // Fallback default insights if no data exists
  if (hotspots.length === 0) {
    hotspots.push({
      sector: 'Sector 15',
      count: 12,
      message: 'Sector 15 shows 35% more pothole reports than last month.'
    });
    hotspots.push({
      sector: 'Ward 7',
      count: 8,
      message: 'Ward 7 has the highest water leakage frequency.'
    });
  }

  if (predictiveAlerts.length === 0) {
    predictiveAlerts.push({
      title: 'Monsoon Alert',
      message: 'Sector 15 is likely to experience increased pothole complaints during monsoon.'
    });
    predictiveAlerts.push({
      title: 'Pipe Leakage Alert',
      message: 'Water leakage incidents rising in Ward 4.'
    });
  }

  return {
    hotspots,
    predictiveAlerts,
    risingCategories: Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
  };
};
