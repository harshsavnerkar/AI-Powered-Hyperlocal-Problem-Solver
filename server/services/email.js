import dotenv from 'dotenv';
dotenv.config();

// Helper to send OTP email via EmailJS API
export const sendOTPEmail = async (toEmail, otp, type = 'Verification') => {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.warn('⚠️ EmailJS is not fully configured. Falling back to console logging.');
    console.log(`✉️ [EMAIL CLIENT] OTP Code for ${toEmail}: ${otp}`);
    return false;
  }

  // Map variables to all common names to ensure compatibility with your existing template
  const payload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    ...(process.env.EMAILJS_PRIVATE_KEY && { accessToken: process.env.EMAILJS_PRIVATE_KEY }),
    template_params: {
      to_email: toEmail,
      email: toEmail,
      to: toEmail,
      user_email: toEmail,
      otp: otp,
      otp_code: otp,
      code: otp,
      verification_code: otp,
      message: `Your ${type} verification code is ${otp}. This code is valid for 5 minutes.`,
      otp_type: type
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

    console.log(`✉️ [EMAIL CLIENT] Real OTP Email successfully delivered via EmailJS to ${toEmail}.`);
    return true;
  } catch (error) {
    console.error(`❌ [EMAIL CLIENT] Failed to send EmailJS email to ${toEmail}:`, error.message);
    console.warn(`⚠️ [FALLBACK] Logging OTP code in console terminal instead: ${otp}`);
    return false;
  }
};
