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

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: "Fehler beim Abrufen der Bilder",
      };
    }

    const data = await res.json();
    const urls = data.resources.map((r) => r.secure_url);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(urls),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: `Serverfehler: ${err}`,
    };
  }
};
