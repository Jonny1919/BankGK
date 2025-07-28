const FormData = require("form-data");
const fetch = require("node-fetch");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  try {
    // FormData mit dem Bild (Base64 oder Blob) vom Frontend empfangen
    const { imageBase64 } = JSON.parse(event.body);

    if (!imageBase64) {
      return { statusCode: 400, body: "Kein Bild erhalten" };
    }

    const form = new FormData();
    form.append("file", imageBase64);
    form.append("upload_preset", uploadPreset);
    form.append("folder", "Galerie");

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
