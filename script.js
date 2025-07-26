
document.getElementById("fileElem").addEventListener("change", handleFiles);

function handleFiles(event) {
  const files = event.target.files;
  const preview = document.getElementById("preview");
  preview.innerHTML = "";

  [...files].forEach(file => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = document.createElement("img");
      img.src = e.target.result;
      img.style.maxWidth = "100%";
      img.style.marginTop = "10px";
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}
