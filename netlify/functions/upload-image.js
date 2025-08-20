const FormData = require("form-data");
const fetch = require("node-fetch");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  try {
    // Bild Base64 + Dateiname aus dem Frontend auslesen
    const { imageBase64, filename } = JSON.parse(event.body);

    if (!imageBase64 || !filename) {
      return { statusCode: 400, body: "Missing image data or filename" };
    }

    const form = new FormData();
    form.append("file", imageBase64);
    form.append("upload_preset", uploadPreset);
    form.append("folder", "Galerie");
    form.append("public_id", filename.replace(/\.[^/.]+$/, "")); // optional: Dateiname ohne Endung als public_id

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: form,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: data.error.message || "Upload-Fehler" }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: data.secure_url }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.toString() }) };
  }
};
