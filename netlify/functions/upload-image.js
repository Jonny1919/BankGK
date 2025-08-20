// functions/upload-image.js
const FormData = require("form-data");
const fetch = require("node-fetch");

exports.handler = async (event) => {
  console.log("=== Upload Function gestartet ===");

  // 1️⃣ Prüfen, ob POST
  if (event.httpMethod !== "POST") {
    console.log("Nicht-POST Request");
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  console.log("Event Body Raw:", event.body);

  let body;
  try {
    body = JSON.parse(event.body);
    console.log("Parsed Body:", body);
  } catch (err) {
    console.error("Fehler beim JSON-Parsing:", err);
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const imageBase64 = body.imageBase64;
  const filename = body.filename || "file";

  if (!imageBase64) {
    console.log("Kein imageBase64 im Request");
    return { statusCode: 400, body: JSON.stringify({ error: "Kein Bild erhalten" }) };
  }

  console.log("Received Base64 length:", imageBase64.length);

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    console.error("Environment-Variablen fehlen!");
    return { statusCode: 500, body: JSON.stringify({ error: "Server misconfigured" }) };
  }

  try {
    const form = new FormData();
    form.append("file", `data:image/png;base64,${imageBase64}`);
    form.append("upload_preset", uploadPreset);
    form.append("folder", "Galerie");

    console.log("FormData vorbereitet, sende Upload an Cloudinary...");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: form }
    );

    const dataText = await res.text(); // Erst als Text lesen, um fehlerhafte JSON zu sehen
    console.log("Cloudinary Response Text:", dataText);

    let data;
    try {
      data = JSON.parse(dataText);
    } catch (err) {
      console.error("Fehler beim Parsen der Cloudinary Response:", err);
      return { statusCode: 500, body: JSON.stringify({ error: "Invalid JSON von Cloudinary", raw: dataText }) };
    }

    if (!res.ok) {
      console.error("Cloudinary Upload Error:", data);
      return { statusCode: res.status, body: JSON.stringify({ error: data.error?.message || "Upload-Fehler" }) };
    }

    console.log("Upload erfolgreich:", data.secure_url);
    return { statusCode: 200, body: JSON.stringify({ url: data.secure_url }) };

  } catch (err) {
    console.error("Uncaught Error im Try:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.toString() }) };
  }
};
