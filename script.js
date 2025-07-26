const input = document.getElementById('imageInput');
const formatSelect = document.getElementById('formatSelect');
const qualityRange = document.getElementById('qualityRange');
const qualityValue = document.getElementById('qualityValue');
const maxWidthInput = document.getElementById('maxWidth');
const maxHeightInput = document.getElementById('maxHeight');
const convertBtn = document.getElementById('convertBtn');
const output = document.getElementById('output');

qualityRange.addEventListener('input', () => {
  qualityValue.textContent = qualityRange.value;
});

convertBtn.addEventListener('click', async () => {
  output.innerHTML = '';
  if (!input.files.length) {
    alert('Please select one or more images!');
    return;
  }

  const format = formatSelect.value;
  const quality = qualityRange.value / 100;
  const maxWidth = parseInt(maxWidthInput.value) || 1024;
  const maxHeight = parseInt(maxHeightInput.value) || 1024;

  for (const file of input.files) {
    try {
      const img = await loadImage(URL.createObjectURL(file));

      // Calculate target size (maintain aspect ratio)
      let targetWidth = img.width;
      let targetHeight = img.height;

      if (targetWidth > maxWidth || targetHeight > maxHeight) {
        const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
        targetWidth = Math.floor(targetWidth * ratio);
        targetHeight = Math.floor(targetHeight * ratio);
      }

      // Draw to canvas
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Select mime type
      let mimeType = 'image/png';
      if (format === 'jpeg') mimeType = 'image/jpeg';
      else if (format === 'webp') mimeType = 'image/webp';
      else if (format === 'bmp') mimeType = 'image/bmp';
      else if (format === 'gif') mimeType = 'image/gif'; // fallback below
      else if (format === 'tiff') mimeType = 'image/png'; // fallback, not supported on canvas
      else if (format === 'avif') mimeType = 'image/avif';

      // canvas.toBlob fallback for unsupported types
      const blob = await new Promise((resolve) => {
        if (['image/gif', 'image/tiff', 'image/bmp'].includes(mimeType)) {
          // fallback to png for unsupported types
          canvas.toBlob(resolve, 'image/png', quality);
        } else {
          canvas.toBlob(resolve, mimeType, quality);
        }
      });

      const url = URL.createObjectURL(blob);
      const ext = (mimeType === 'image/png' && ['tiff', 'bmp', 'gif'].includes(format)) ? 'png' : format;

      // Create preview & download link
      const container = document.createElement('div');
      container.classList.add('converted-image');

      const preview = document.createElement('img');
      preview.src = url;
      preview.classList.add('preview');
      preview.alt = file.name;

      const link = document.createElement('a');
      link.href = url;
      link.download = file.name.replace(/\.[^/.]+$/, '') + '.' + ext;
      link.textContent = `Download ${link.download}`;
      link.classList
