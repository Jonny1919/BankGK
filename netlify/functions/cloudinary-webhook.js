const nodemailer = require("nodemailer");

exports.handler = async (event) => {
  console.log("Cloudinary Webhook gestartet");

  let body;

  // Prüfen, ob der Body base64-codiert ist
  if (event.isBase64Encoded) {
    body = Buffer.from(event.body, "base64").toString("utf-8");
  } else {
    body = event.body;
  }

  console.log("Rohbody:", body);

  // Versuchen, JSON zu parsen, sonst als URLSearchParams
  let payload;
  try {
    payload = JSON.parse(body);
  } catch (err) {
    const params = new URLSearchParams(body);
    payload = Object.fromEntries(params.entries());
  }

  console.log("Geparster Payload:", payload);

  // Mail-Transporter (Web.de)
  const transporter = nodemailer.createTransport({
    host: "smtp.web.de",
    port: 587,
    secure: false, // TLS später
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // E-Mail konfigurieren
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // an dich selbst, kann andere E-Mail sein
    subject: "Neues Bild in der Galerie",
    text: `Ein neues Bild wurde hochgeladen!\n\nDetails: ${JSON.stringify(payload, null, 2)}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Mail gesendet!");
    return { statusCode: 200, body: "OK" };
  } catch (err) {
    console.error("Fehler beim Senden der Mail:", err);
    return { statusCode: 500, body: "Mail konnte nicht gesendet werden" };
  }
};
