const nodemailer = require("nodemailer");

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body); // Cloudinary sendet JSON

    // Bild-Infos auslesen
    const imageUrl = body.secure_url;
    const publicId = body.public_id;

    // Mail-Transport einrichten (Beispiel: Gmail SMTP)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // deine Gmail-Adresse
        pass: process.env.EMAIL_PASS, // App-Passwort!
      },
    });

    // Mail zusammenbauen
    await transporter.sendMail({
      from: `"Galerie Bot" <${process.env.EMAIL_USER}>`,
      to: "deine@email.de",
      subject: "📸 Neues Bild hochgeladen!",
      text: `Es wurde ein neues Bild hochgeladen: ${imageUrl}`,
      html: `<p>Neues Bild hochgeladen:</p><img src="${imageUrl}" width="300"/><br><a href="${imageUrl}">${imageUrl}</a>`,
    });

    return { statusCode: 200, body: "E-Mail versendet" };
  } catch (err) {
    return { statusCode: 500, body: `Fehler: ${err.message}` };
  }
};
