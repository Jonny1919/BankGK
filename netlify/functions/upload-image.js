<script>
async function loadGallery() {
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "Lade Bilder...";
  try {
    const res = await fetch("/.netlify/functions/get-cloudinary-images");
    const data = await res.json();

    gallery.innerHTML = "";

    if (Array.isArray(data)) {
      data.forEach(url => {
        const image = document.createElement("img");
        image.src = url;
        image.loading = "lazy";
        image.addEventListener("click", () => openLightbox(url));
        gallery.appendChild(image);
      });
    } else if (data.error) {
      gallery.innerText = "Fehler vom Server: " + data.error;
    } else {
      gallery.innerText = "Unerwartete Antwort vom Server.";
    }
  } catch (err) {
    gallery.innerText = "Fehler beim Laden: " + err.message;
  }
}

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
    const base64 = reader.result.split(",")[1]; // nur Base64 ohne data:image/...

    try {
      const res = await fetch("/.netlify/functions/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, filename: file.name }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = { error: "Keine JSON-Antwort vom Server" };
      }

      if (res.ok) {
        status.innerText = "Upload erfolgreich!";
        input.value = "";
        loadGallery();
      } else {
        status.innerText = "Upload fehlgeschlagen: " + (data.error || "Unbekannter Fehler");
      }
    } catch (err) {
      status.innerText = "Fehler beim Upload: " + err.message;
    }
  };

  reader.readAsDataURL(file);
}

// Lightbox-Funktionen
function openLightbox(url) {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  lightboxImg.src = url;
  lightbox.style.display = "flex";
}
function closeLightbox() {
  document.getElementById("lightbox").style.display = "none";
}

// Event-Listener
document.querySelector(".close").addEventListener("click", closeLightbox);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });
document.getElementById("lightbox").addEventListener("click", (e) => {
  if (e.target.id === "lightbox") closeLightbox();
});
document.getElementById("uploadBtn").addEventListener("click", uploadImage);

// Initiale Galerie laden
loadGallery();
</script>
