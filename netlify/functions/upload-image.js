const FormData = require("form-data");
const fetch = require("node-fetch");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  try {
    console.log("Event Body:", event.body);
    const { imageBase64, filename } = JSON.parse(event.body);

    if (!imageBase64) {
      return { statusCode: 400, body: JSON.stringify({ error: "Kein Bild erhalten" }) };
    }

    console.log("Received Base64 length:", imageBase64.length);

    const form = new FormData();
    form.append("file", `data:image/jpeg;base64,${imageBase64}`);
    form.append("upload_preset", uploadPreset);
    form.append("folder", "Galerie");
    if (filename) form.append("public_id", filename.replace(/\.[^/.]+$/, ""));

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: form,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("Cloudinary Error:", data);
      return {
        statusCode: res.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: data.error?.message || "Upload-Fehler" }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: data.secure_url }),
    };
  } catch (err) {
    console.error("Function Error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.toString() }),
    };
  }
};
