const FormData = require("form-data");
const fetch = require("node-fetch");

exports.handler = async (event) => {
  console.log("Event Body Raw:", event.body);

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let imageBase64;
  let filename;

  try {
    const body = JSON.parse(event.body);
    imageBase64 = body.imageBase64;
    filename = body.filename;

    console.log("Parsed body:", body);
    console.log("Received Base64 length:", imageBase64 ? imageBase64.length : "undefined");
    console.log("Filename:", filename);
  } catch (err) {
    console.error("Error parsing JSON body:", err);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Ungültiges JSON im Request Body", details: err.toString() }),
    };
  }

  if (!imageBase64) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Kein Bild erhalten", filename }),
    };
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  try {
    const form = new FormData();
    form.append("file", `data:image/png;base64,${imageBase64}`); // wir packen wieder data:image vor
    form.append("upload_preset", uploadPreset);
    form.append("folder", "Galerie");

    console.log("FormData vorbereitet, starte Upload...");

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    console.log("Cloudinary response:", data);

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: data.error ? data.error.message : "Cloudinary Upload fehlgeschlagen" }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: data.secure_url }),
    };
  } catch (err) {
    console.error("Upload Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Upload-Fehler aufgetreten", details: err.toString() }),
    };
  }
};
