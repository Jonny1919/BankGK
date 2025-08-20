const fetch = require("node-fetch");
const FormData = require("form-data");

exports.handler = async (event) => {
  try {
    // Prüfen, ob ein Bild gesendet wurde
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No image data received" }),
      };
    }

    let parsedBody;
    try {
      parsedBody = JSON.parse(event.body);
    } catch (err) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid JSON" }),
      };
    }

    const { imageBase64, filename } = parsedBody;

    if (!imageBase64 || !filename) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing image data or filename" }),
      };
    }

    // Cloudinary Variablen
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    const form = new FormData();
    form.append("file", `data:image/jpeg;base64,${imageBase64}`);
    form.append("upload_preset", uploadPreset);
    form.append("folder", "Galerie");
    form.append("public_id", filename.replace(/\.[^/.]+$/, "")); // Dateiendung entfernen

    // Upload zu Cloudinary
    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: form }
    );

    const cloudData = await cloudRes.json();

    if (!cloudRes.ok) {
      return {
        statusCode: cloudRes.status,
        body: JSON.stringify({ error: cloudData }),
      };
    }

    // Antwort an Frontend
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Upload erfolgreich",
        url: cloudData.secure_url,
      }),
    };
  } catch (err) {
    console.error("Upload Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
