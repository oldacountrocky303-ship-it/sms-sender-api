// /api/send-sms.js
// Vercel Serverless Function — forwards SMS request to your Android phone
// running the "SMS Gateway for Android" (SMSGate) app via its free Cloud API.
//
// Docs of underlying service: https://docs.sms-gate.app/

module.exports = async (req, res) => {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed. Use POST." });
  }

  const { number, text, secret } = req.body || {};

  // 1) Protect your API with your own secret key so random people can't spam-send SMS
  if (!secret || secret !== process.env.API_SECRET) {
    return res.status(401).json({ success: false, error: "Unauthorized: invalid secret" });
  }

  // 2) Basic validation
  if (!number || !text) {
    return res.status(400).json({ success: false, error: "Both 'number' and 'text' are required" });
  }

  // 3) Normalize Bangladeshi number to E.164 (+880XXXXXXXXXX)
  let cleanNumber = String(number).trim().replace(/[\s-]/g, "");
  if (/^01[3-9]\d{8}$/.test(cleanNumber)) {
    cleanNumber = "+88" + cleanNumber;
  } else if (/^8801[3-9]\d{8}$/.test(cleanNumber)) {
    cleanNumber = "+" + cleanNumber;
  } else if (/^\+8801[3-9]\d{8}$/.test(cleanNumber)) {
    // already fine
  } else {
    return res.status(400).json({ success: false, error: "Invalid Bangladeshi phone number format" });
  }

  // 4) Credentials for your SMSGate cloud account (set these in Vercel env vars)
  const SMS_USERNAME = process.env.SMS_USERNAME;
  const SMS_PASSWORD = process.env.SMS_PASSWORD;

  if (!SMS_USERNAME || !SMS_PASSWORD) {
    return res.status(500).json({ success: false, error: "Server misconfigured: missing SMS gateway credentials" });
  }

  try {
    const authHeader = "Basic " + Buffer.from(`${SMS_USERNAME}:${SMS_PASSWORD}`).toString("base64");

    const response = await fetch("https://api.sms-gate.app/3rdparty/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        textMessage: { text: text },
        phoneNumbers: [cleanNumber],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ success: false, error: data });
    }

    return res.status(200).json({
      success: true,
      message: "SMS queued successfully",
      number: cleanNumber,
      gatewayResponse: data,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
