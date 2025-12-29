import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

let client = null;

if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

// Helper function to validate and format phone numbers
const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  
  // Remove all non-digit characters
  let cleaned = phone.toString().replace(/\D/g, '');
  
  // Check if it's an Indian number
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    // Already has country code
    return `+${cleaned}`;
  } else if (cleaned.length === 10) {
    // Add India country code
    return `+91${cleaned}`;
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    // Remove leading 0 and add country code
    return `+91${cleaned.substring(1)}`;
  }
  
  // Return null if format is invalid
  return null;
};

export const sendSMS = async (to, message) => {
  try {
    // Format the phone number
    const formattedTo = formatPhoneNumber(to);
    
    if (!formattedTo) {
      console.error('Invalid phone number format:', to);
      return { success: false, error: 'Invalid phone number format' };
    }
    
    if (!client) {
      console.log('📱 SMS would be sent to:', formattedTo);
      console.log('📝 Message:', message);
      return { 
        success: true, 
        message: 'SMS logged (Twilio not configured)',
        debug: { to: formattedTo, message }
      };
    }

    console.log('📱 Sending SMS to:', formattedTo);
    
    const result = await client.messages.create({
      body: message,
      from: twilioPhone,
      to: formattedTo
    });

    console.log('✅ SMS sent successfully:', result.sid);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('❌ SMS Error:', error.message);
    return { 
      success: false, 
      error: error.message,
      code: error.code
    };
  }
};

export const sendWhatsApp = async (to, message) => {
  try {
    // Format the phone number
    const formattedTo = formatPhoneNumber(to);
    
    if (!formattedTo) {
      console.error('Invalid phone number format for WhatsApp:', to);
      return { success: false, error: 'Invalid phone number format' };
    }
    
    if (!client) {
      console.log('💬 WhatsApp would be sent to:', formattedTo);
      console.log('📝 Message:', message);
      return { 
        success: true, 
        message: 'WhatsApp logged (Twilio not configured)',
        debug: { to: formattedTo, message }
      };
    }

    // Format for WhatsApp
    const whatsappNumber = formattedTo.startsWith('whatsapp:') ? formattedTo : `whatsapp:${formattedTo}`;
    const fromNumber = twilioPhone.startsWith('whatsapp:') ? twilioPhone : `whatsapp:${twilioPhone}`;
    
    console.log('💬 Sending WhatsApp to:', whatsappNumber);
    
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: whatsappNumber
    });

    console.log('✅ WhatsApp sent successfully:', result.sid);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('❌ WhatsApp Error:', error.message);
    return { 
      success: false, 
      error: error.message,
      code: error.code
    };
  }
};