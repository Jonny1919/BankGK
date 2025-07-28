exports.handler = async () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?prefix=Galerie/&max_results=100`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${apiKey}:${apiSecret}`).toString("base64"),
      },
    });

    const data = await res.json();

    console.log("Cloudinary API Response:", data);

    // Rückgabe der kompletten Antwort zu Debug-Zwecken
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.toString() }),
    };
  }
};
