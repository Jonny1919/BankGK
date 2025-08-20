const cloudName = "df5pxld68";
const uploadPreset = "anonymous_upload";

document.getElementById("uploadBtn").addEventListener("click", async () => {
  const fileInput = document.getElementById("fileInput");
  if (!fileInput.files.length) return alert("Bitte eine Datei auswählen.");

  const file = fileInput.files[0];
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "Galerie");

  const progress = document.querySelector(".progress");
  const progressBar = document.getElementById("progressBar");
  progress.classList.remove("d-none");

  const xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  xhr.upload.onprogress = (event) => {
    if (event.lengthComputable) {
      const percent = Math.round((event.loaded / event.total) * 100);
      progressBar.style.width = percent + "%";
      progressBar.textContent = percent + "%";
    }
  };
  xhr.onload = async () => {
    progressBar.style.width = "100%";
    progressBar.textContent = "100%";
    setTimeout(() => progress.classList.add("d-none"), 1000);
    fileInput.value = "";
    await fetchImages();
  };
  xhr.send(formData);
});

async function fetchImages() {
  const res = await fetch("/.netlify/functions/get-images");
  const images = await res.json();
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";
  images.reverse().forEach(url => {
    const img = document.createElement("img");
    img.src = url;
    gallery.appendChild(img);
  });
}

window.onload = fetchImages;
