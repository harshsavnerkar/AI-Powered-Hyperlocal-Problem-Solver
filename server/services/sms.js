import dotenv from 'dotenv';
dotenv.config();

// Helper to compute distance in meters between two geocoordinates
const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in meters
};

/**
 * Broadcast SMS alerts to nearby volunteers when a critical issue is reported
 * @param {object} issue The reported issue object
 * @param {array} allUsers List of users to filter volunteers from
 */
export const broadcastCriticalSmsAlert = async (issue, allUsers) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  const lat = issue.location?.latitude;
  const lon = issue.location?.longitude;

  if (!lat || !lon) return;

  // Filter volunteers who have a phone number registered
  const volunteers = allUsers.filter(
    (u) => u.role === 'volunteer' && u.phone && u.phone.trim() !== ''
  );

  // Find volunteers within 2km (2000 meters)
  const nearbyVolunteers = volunteers.filter((vol) => {
    // If volunteer coordinates aren't defined, fallback to true for demonstration
    const volLat = vol.latitude || 28.6139; // default Delhi center
    const volLon = vol.longitude || 77.2090;
    const distance = getDistanceInMeters(lat, lon, volLat, volLon);
    return distance <= 2000;
  });

  console.log(`📡 [SMS SERVICE] Found ${nearbyVolunteers.length} volunteers within 2km of critical report.`);

  const messageBody = `⚠️ [CRITICAL CIVIC ALERT] A critical ${issue.category} has been reported near ${issue.location.address}. Please check your CommunityHero volunteer dashboard to assist!`;

  for (const vol of nearbyVolunteers) {
    if (!accountSid || !authToken || !twilioPhone) {
      console.warn('⚠️ Twilio is not fully configured. Logging SMS alert to console.');
      console.log(`✉️ [SMS SIMULATION] To: ${vol.phone} | Msg: ${messageBody}`);
      continue;
    }

    try {
      // Send Twilio SMS via direct HTTP Request to keep backend lightweight
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const params = new URLSearchParams();
      params.append('To', vol.phone);
      params.append('From', twilioPhone);
      params.append('Body', messageBody);

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${auth}`,
          },
          body: params.toString(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Twilio response error');
      }

      console.log(`✉️ [SMS SERVICE] Real alert delivered successfully to volunteer: ${vol.phone}`);
    } catch (err) {
      console.error(`❌ [SMS SERVICE] Failed to send SMS to ${vol.phone}:`, err.message);
    }
  }
};
