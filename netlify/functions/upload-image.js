const cloudinary = require('cloudinary').v2;

// Cloudinary Konfiguration aus Umgebungsvariablen
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.handler = async function (event, context) {
  try {
    console.log("Event received:", event);

    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Kein Body erhalten" }),
      };
    }

    // Body parsen
    const { filename, imageBase64 } = JSON.parse(event.body);
    console.log("Filename:", filename);
    console.log("Base64 length:", imageBase64?.length);

    if (!imageBase64) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Kein Bild Base64 enthalten" }),
      };
    }

    // Bild hochladen
    const uploadResponse = await cloudinary.uploader.upload(
      `data:image/png;base64,${imageBase64}`, // Cloudinary braucht den Prefix
      {
        folder: "Galerie",
        public_id: filename.replace(/\.[^/.]+$/, ""), // Dateiendung entfernen
        overwrite: true,
      }
    );

    console.log("Cloudinary Response:", uploadResponse);

    return {
      statusCode: 200,
      body: JSON.stringify({ url: uploadResponse.secure_url }),
    };

  } catch (error) {
    console.error("Fehler beim Upload:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
