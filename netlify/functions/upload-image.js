const response = await fetch("/.netlify/functions/upload-image", {
  method: "POST",
  body: formData,
});

// Versuchen, JSON zu parsen, Fehler abfangen
let data;
try {
  data = await response.json();
} catch (err) {
  console.error("Fehler beim Parsen der Server-Antwort:", err);
  data = { error: "Serverantwort konnte nicht geparst werden" };
}

if (!response.ok) {
  console.error("Upload fehlgeschlagen:", data);
} else {
  console.log("Upload erfolgreich:", data);
}
