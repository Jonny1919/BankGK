// netlify/functions/upload-image.js
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.handler = async function(event) {
  try {
    const body = JSON.parse(event.body || "{}");

    if (!body.imageBase64 || !body.filename) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Fehlende imageBase64 oder filename" }),
      };
    }

    // Dateiendung erkennen
    const extMatch = body.filename.match(/\.(jpg|jpeg|png)$/i);
    if (!extMatch) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Nur JPG, JPEG oder PNG erlaubt" }),
      };
    }
    const ext = extMatch[1].toLowerCase();

    // Debug
    console.log("Upload gestartet:", body.filename, "Erkannte Endung:", ext);

    // Cloudinary Upload
    const uploadResult = await cloudinary.uploader.upload(
      `data:image/${ext};base64,${body.imageBase64}`,
      {
        folder: "Galerie",
        public_id: body.filename.replace(/\.[^/.]+$/, ""), // ohne Endung
      }
    );

    console.log("Cloudinary Result:", uploadResult.secure_url);

    return {
      statusCode: 200,
      body: JSON.stringify({ url: uploadResult.secure_url }),
    };
  } catch (err) {
    console.error("Upload Error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
