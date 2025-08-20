const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.handler = async (event) => {
  console.log("Event Body:", event.body);

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { imageBase64, filename } = JSON.parse(event.body);
    console.log("Received Base64 length:", imageBase64?.length, "Filename:", filename);

    if (!imageBase64) {
      return { statusCode: 400, body: JSON.stringify({ error: "Kein Bild erhalten" }) };
    }

    // Upload zu Cloudinary
    const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${imageBase64}`, {
      folder: "Galerie",
      public_id: filename ? filename.split(".")[0] : undefined,
    });

    console.log("Upload Result:", result);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: result.secure_url }),
    };
  } catch (err) {
    console.error("Upload Error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
