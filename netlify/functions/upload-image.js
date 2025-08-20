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

    console.log("Function Payload:", body);

    // Dateiendung prüfen
    const ext = body.filename.split('.').pop().toLowerCase();
    if (!["jpg", "jpeg", "png"].includes(ext)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Nur jpg/jpeg/png erlaubt" }),
      };
    }

    // Data URI für Cloudinary
    const dataUri = `data:image/${ext};base64,${body.imageBase64}`;

    // Upload zu Cloudinary
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: "Galerie",
      public_id: body.filename.replace(/\.[^/.]+$/, ""), // ohne Endung
    });

    console.log("Cloudinary Result:", uploadResult);

    return {
      statusCode: 200,
      body: JSON.stringify({ url: uploadResult.secure_url }),
    };

  } catch (err) {
    console.error("Upload Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
