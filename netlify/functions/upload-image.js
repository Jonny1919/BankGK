const fetch = require("node-fetch");
const FormData = require("form-data");

exports.handler = async (event) => {
  try {
    // Nur POST erlauben
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const body = JSON.parse(event.body); // Hier erwarten wir { image: "data:image/..." }
    if (!body || !body.image) {
      return { statusCode: 400, body: JSON.stringify({ error: "No image provided" }) };
    }

    const imageData = body.image;

    const formData = new FormData();
    formData.append("file", imageData);
    formData.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", "Galerie");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return { statusCode: res.status, body: JSON.stringify({ error: data }) };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: data.secure_url }),
    };
  } catch (err) {
    console.error("Upload error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
