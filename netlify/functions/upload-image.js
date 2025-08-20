const fetch = require("node-fetch");
const FormData = require("form-data");
const nodemailer = require("nodemailer");

exports.handler = async (event) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No image data received" }),
      };
    }

    // Event Body parsen
    let parsed;
    try {
      parsed = JSON.parse(event.body);
    } catch (err) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid JSON body" }),
      };
    }

    const { imageBase64, filename } = parsed;

    if (!imageBase64 || !filename) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing image data or filename" }),
      };
    }

    // Cloudinary Daten
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    const form = new FormData();
    form.append("file", `data:image/jpeg;base64,${imageBase64}`);
    form.append("upload_preset", uploadPreset);
    form.append("folder", "Galerie");
    form.append("public_id", filename.replace(/\.[^/.]+$/, ""));

    // Cloudinary Upload
    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: form }
    );

    const text = await cloudRes.text();
    console.log("Cloudinary Response Status:", cloudRes.status);
    console.log("Cloudinary Response Text:", text);

    let cloudData;
    try {
      cloudData = JSON.parse(text);
    } catch (err) {
      return {
        statusCode: cloudRes.status,
        body: JSON.stringify({ error: "Cloudinary returned non-JSON", text }),
      };
    }

    if (!cloudRes.ok) {
      return {
        statusCode: cloudRes.status,
        body: JSON.stringify({ error: cloudData }),
      };
    }

    // Nodemailer Setup
    const transporter = nodemailer.createTransport({
      host: "smtp.web.de",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Mail senden (async, Fehler nur loggen)
    transporter.sendMail({
      from: `"Galerie Upload" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "Neues Bild hochgeladen",
      text: `Es wurde ein neues Bild hochgeladen: ${cloudData.secure_url}`,
    }).catch((err) => console.error("Email send error:", err));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Upload erfolgreich",
        url: cloudData.secure_url,
      }),
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
