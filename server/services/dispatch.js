import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Dispatch validated issue details to the municipal authority via EmailJS or NodeMailer
 * @param {object} issue The issue document/object
 * @param {boolean} isFallback Whether running on fallback db JSON store
 * @param {object} store Fallback db JSON store object
 */
export const dispatchIssueToMunicipality = async (issue, isFallback = false, store = null) => {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  console.log(`📡 [DISPATCH SERVICE] Preparing municipal dispatch for Issue: "${issue.title}"...`);

  // 1. Determine target email addresses (all registered Admin emails in database)
  let adminEmails = [];
  if (isFallback && store) {
    adminEmails = store.users.filter(u => u.role === 'admin').map(u => u.email);
  } else {
    try {
      const User = mongoose.model('User');
      const admins = await User.find({ role: 'admin' });
      adminEmails = admins.map(u => u.email);
    } catch (e) {
      console.error('Failed to query admins from db:', e);
    }
  }

  // Fallback to process.env.MUNICIPAL_EMAIL if no admins are registered in the db
  if (adminEmails.length === 0) {
    adminEmails = [process.env.MUNICIPAL_EMAIL || 'harsh.savnerkar.developer@gmail.com'];
  }

  console.log(`📡 [DISPATCH SERVICE] Dispatching report to ${adminEmails.length} admin(s): ${adminEmails.join(', ')}`);

  // Build the formatted grievance dispatch report body
  const reportBody = `
==================================================
⚠️ OFFICIAL CIVIC GRIEVANCE DISPATCH REPORT
==================================================
This issue has received 3 validations on the CommunityHero platform
and has been automatically dispatched to the Municipal Department.

📋 GRIEVANCE DETAILS:
--------------------------------------------------
• Title: ${issue.title}
• Category: ${issue.category}
• Urgency Level: ${issue.priority}
• Description: ${issue.description}
• Reported On: ${new Date(issue.createdAt).toLocaleString()}

📍 GEOLOCATION & ADDRESS:
--------------------------------------------------
• Address: ${issue.location?.address || 'Not Provided'}
• Coordinates: Lat: ${issue.location?.latitude || 'N/A'}, Lon: ${issue.location?.longitude || 'N/A'}
• Open in Google Maps: https://www.google.com/maps/search/?api=1&query=${issue.location?.latitude},${issue.location?.longitude}

🖼️ MEDIA ATTACHMENTS:
--------------------------------------------------
• Photo: ${issue.media?.imageUrl ? `https://ai-powered-hyperlocal-problem-solver.onrender.com${issue.media.imageUrl}` : 'No photo uploaded'}
• Video: ${issue.media?.videoUrl || 'No video uploaded'}

==================================================
Please inspect, assign verification teams, and update the resolution status.
CommunityHero Civic Dispatch Bot
==================================================
  `;

  // Iterate over each admin email address and dispatch
  let allSuccess = true;
  for (const targetEmail of adminEmails) {
    if (!serviceId || !templateId || !publicKey) {
      console.warn('⚠️ EmailJS is not fully configured. Falling back to console dispatch output.');
      console.log(`✉️ [MOCK DISPATCH SEND] To: ${targetEmail}\n`, reportBody);
      allSuccess = false;
      continue;
    }

    const payload = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      ...(privateKey && { accessToken: privateKey }),
      template_params: {
        to_email: targetEmail,
        email: targetEmail,
        to: targetEmail,
        user_email: targetEmail,
        otp: 'DISPATCH',
        otp_code: 'DISPATCH',
        code: 'DISPATCH',
        verification_code: 'DISPATCH',
        message: reportBody,
        otp_type: 'Municipal Dispatch'
      }
    };

    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`EmailJS API returned status ${response.status}: ${errorText}`);
      }

      console.log(`✉️ [DISPATCH SERVICE] Grievance successfully emailed to ${targetEmail} via EmailJS.`);
    } catch (error) {
      console.error(`❌ [DISPATCH SERVICE] Failed to email dispatch report to ${targetEmail}:`, error.message);
      allSuccess = false;
    }
  }

  return allSuccess;
};
