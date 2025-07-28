exports.handler = async () => {
  console.log("get-cloudinary-images function gestartet");

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  console.log("Cloud Name:", cloudName);
  console.log("API Key vorhanden?", !!apiKey);
  console.log("API Secret vorhanden?", !!apiSecret);
const fetch = require("node-fetch");

exports.handler = async () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Environment variables not set" }),
    };
  }

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload?prefix=Galerie/&max_results=100`,
      {
        headers: {
          Authorization: "Basic " + Buffer.from(apiKey + ":" + apiSecret).toString("base64"),
        },
      }
    );

    if (!res.ok) {
      const errorBody = await res.text();
      return { statusCode: res.status, body: `Cloudinary API error: ${errorBody}` };
    }

    const data = await res.json();
    const urls = data.resources.map((r) => r.secure_url);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(urls),
    };
  } catch (err) {
    return { statusCode: 500, body: `Fetch error: ${err.message}` };
  }
};
