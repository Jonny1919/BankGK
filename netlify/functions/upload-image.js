// netlify/functions/upload-image.js

const cloudinary = require("cloudinary").v2;

// Cloudinary konfigurieren
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.handler = async function (event, context) {
  console.log("=== START upload-image Function ===");
  console.log("HTTP Method:", event.httpMethod);
  console.log("Raw event.body:", event.body?.substring(0, 200)); // nur Anfang zeigen

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
    console.log("Parsed body keys:", Object.keys(body));
  } catch (err) {
    console.error("JSON parse error:", err);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON" }),
    };
  }

  const { imageBase64, filename } = body;
  console.log("Filename:", filename);
  console.log("imageBase64 length:", imageBase64?.length);

  if (!imageBase64 || !filename) {
    console.error("Missing imageBase64 or filename!");
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing imageBase64 or filename" }),
    };
  }

  try {
    const uploadResponse = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${imageBase64}`,
      {
        folder: "Galerie",
        use_filename: true,
        unique_filename: false,
        overwrite: true,
      }
    );
    console.log("Cloudinary response:", uploadResponse.secure_url);

    return {
      statusCode: 200,
      body: JSON.stringify({ url: uploadResponse.secure_url }),
    };
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Cloudinary upload failed" }),
    };
  }
};
