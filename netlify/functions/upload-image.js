const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.handler = async function (event, context) {
  console.log("Event received:", event);

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    console.error("Failed to parse JSON:", err);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON" })
    };
  }

  const { imageBase64, filename } = body;

  if (!imageBase64 || !filename) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing image data or filename" })
    };
  }

  console.log("Received filename:", filename);
  console.log("Base64 length:", imageBase64.length);

  try {
    const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${imageBase64}`, {
      folder: "Galerie",
      public_id: filename.split(".")[0],
      overwrite: true
    });

    console.log("Cloudinary upload result:", result);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Upload erfolgreich", url: result.secure_url })
    };
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Cloudinary upload failed", details: err.message })
    };
  }
};
