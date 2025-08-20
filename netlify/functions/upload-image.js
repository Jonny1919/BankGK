const FormData = require("form-data");
const fetch = require("node-fetch");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  try {
    console.log("Event Body:", event.body);

    const { imageBase64, filename } = JSON.parse(event.body);

    console.log("Received Base64 length:", imageBase64?.length);

    if (!imageBase64) {
      return { statusCode: 400, body: JSON.stringify({ error: "Kein Bild erhalten" }) };
    }

    const form = new FormData();
    form.append("file", "data:image/png;base64," + imageBase64); // Cloudinary erwartet data:image/... prefix
    form.append("upload_preset", uploadPreset);
    form.append("folder", "Galerie");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: form }
    );

    let data;
    try {
      data = await res.json();
    } catch (parseErr) {
      console.error("Fehler beim Parsen der Cloudinary-Antwort:", parseErr);
      const text = await res.text();
      return {
        statusCode: res.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Cloudinary-Fehler: " + text }),
      };
    }

    if (!res.ok) {
      return {
        statusCode: res.status,
        headers: { "C
