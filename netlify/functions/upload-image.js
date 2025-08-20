async function uploadImage() {
  const input = document.getElementById("fileInput");
  const status = document.getElementById("uploadStatus");

  if (!input.files.length) {
    status.innerText = "Bitte erst eine Datei auswählen.";
    return;
  }

  const file = input.files[0];
  status.innerText = "Lade hoch...";

  const reader = new FileReader();
  reader.onload = async function () {
    const result = reader.result;

    if (!result || !result.startsWith("data:image/")) {
      status.innerText = "Fehler: Ungültiges Bildformat.";
      return;
    }

    // Base64 sauber extrahieren
    const base64 = result.split(",")[1];
    if (!base64) {
      status.innerText = "Fehler: Konnte Base64-Daten nicht extrahieren.";
      return;
    }

    const payload = {
      imageBase64: base64,
      filename: file.name || "unnamed.png"
    };

    console.log("Upload-Payload:", payload); // zum Debuggen

    try {
      const res = await fetch("/.netlify/functions/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      console.log("Server Response:", data);

      if (res.ok) {
        status.innerText = "Upload erfolgreich!";
        input.value = "";
        loadGallery();
      } else {
        status.innerText = "Upload fehlgeschlagen: " + (data.error || JSON.stringify(data));
      }
    } catch (err) {
      status.innerText = "Fehler beim Upload: " + err.message;
    }
  };

  reader.readAsDataURL(file);
}
