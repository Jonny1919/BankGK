// netlify/functions/upload-image.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.handler = async function(event, context) {
  console.log("Function aufgerufen!");

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Nur POST erlaubt" }),
    };
  }

  try {
    const { imageBase64, filename } = JSON.parse(event.body || "{}");

    if (!imageBase64 || !filename) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Keine Bilddaten oder Dateiname" }),
      };
    }

    console.log("Upload startet für Datei:", filename);

    const uploadResponse = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${imageBase64}`,
      {
        folder: "Galerie", // Dein Cloudinary-Ordner
        public_id: filename.replace(/\.[^/.]+$/, ""), // ohne Extension
        overwrite: true,
      }
    );

    console.log("Upload erfolgreich:", uploadResponse.secure_url);

    return {
      statusCode: 200,
      body: JSON.stringify({ url: uploadResponse.secure_url }),
    };
  } catch (err) {
    console.error("Fehler beim Upload:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
