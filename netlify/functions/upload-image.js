const fetch = require("node-fetch");
const FormData = require("form-data");
const nodemailer = require("nodemailer");

exports.handler = async (event) => {
  try {
    // Prüfen, ob ein Bild gesendet wurde
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No image data received" }),
      };
    }

    const { imageBase64, filename } = JSON.parse(event.body);

    if (!imageBase64 || !filename) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing image data or filename" }),
      };
    }

    // Cloudinary Variablen
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    const form = new FormData();
    form.append("file", `data:image/jpeg;base64,${imageBase64}`);
    form.append("upload_preset", uploadPreset);
    form.append("folder", "Galerie");
    form.append("public_id", filename.replace(/\.[^/.]+$/, "")); // Dateiendung entfernen

    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: form }
    );

    const cloudData = await cloudRes.json();

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

    // E-Mail verschicken (async, Fehler nur loggen, kein Block für Frontend)
    transporter.sendMail({
      from: `"Galerie Upload" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "Neues Bild hochgeladen",
      text: `Es wurde ein neues Bild hochgeladen: ${cloudData.secure_url}`,
    }).catch((err) => console.error("Email send error:", err));

    // Antwort an Frontend
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Upload erfolgreich",
        url: cloudData.secure_url,
      }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
