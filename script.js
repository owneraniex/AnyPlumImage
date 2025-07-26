async function convertImages() {
  const input = document.getElementById('imageInput');
  const format = document.getElementById('formatSelect').value;
  const output = document.getElementById('output');

  output.innerHTML = ''; // clear previous results

  if (!input.files.length) {
    alert('Please select at least one image.');
    return;
  }

  for (const file of input.files) {
    try {
      const imgURL = URL.createObjectURL(file);
      const img = await loadImage(imgURL);

      // Create canvas and draw image to it
      const canvas = document.createElement('canvas');

      // Optional: Reduce resolution by half (can be enhanced to user input)
      const maxWidth = 1024; // max width allowed
      const maxHeight = 1024; // max height allowed

      let targetWidth = img.width;
      let targetHeight = img.height;

      // Downscale if larger than max dimensions
      if (img.width > maxWidth || img.height > maxHeight) {
        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
        targetWidth = Math.floor(img.width * ratio);
        targetHeight = Math.floor(img.height * ratio);
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Quality setting for JPEG/WebP (0 to 1), adjust as needed
      const quality = 0.85;

      // Convert to selected format
      let mimeType = 'image/png';
      switch (format) {
        case 'jpeg':
          mimeType = 'image/jpeg';
          break;
        case 'webp':
          mimeType = 'image/webp';
          break;
        case 'bmp':
          mimeType = 'image/bmp'; // browser support is limited, fallback to PNG if needed
          break;
        case 'gif':
          mimeType = 'image/gif'; // gif conversion not supported via canvas, fallback needed
          break;
        case 'tiff':
          // TIFF is not supported by canvas.toBlob(), fallback needed
          mimeType = 'image/png';
          break;
        case 'avif':
          mimeType = 'image/avif'; // very limited browser support
          break;
        default:
          mimeType = 'image/png';
      }

      // Get blob from canvas
      const blob = await new Promise(resolve => {
        if (mimeType === 'image/gif' || mimeType === 'image/tiff' || mimeType === 'image/bmp') {
          // canvas cannot create gif, tiff or bmp - fallback to PNG
          canvas.toBlob(resolve, 'image/png', quality);
        } else {
          canvas.toBlob(resolve, mimeType, quality);
        }
      });

      const convertedUrl = URL.createObjectURL(blob);

      // Create download link
      const a = document.createElement('a');
      a.href = convertedUrl;

      // Change extension to selected format (fallback to png if needed)
      let ext = format;
      if (format === 'tiff' || format === 'gif' || format === 'bmp') ext = 'png';

      a.download = file.name.replace(/\.[^/.]+$/, '') + '.' + ext;
      a.textContent = `Download ${a.download}`;
      a.style.display = 'block';
      a.style.marginBottom = '1rem';

      // Show preview image
      const preview = document.createElement('img');
      preview.src = convertedUrl;
      preview.style.maxWidth = '200px';
      preview.style.display = 'block';
      preview.style.marginBottom = '0.5rem';

      // Append preview + link
      const container = document.createElement('div');
      container.style.marginBottom = '2rem';
      container.appendChild(preview);
      container.appendChild(a);

      output.appendChild(container);

      // Release object URL after some time to save memory
      setTimeout(() => URL.revokeObjectURL(convertedUrl), 60000);

      URL.revokeObjectURL(imgURL);
    } catch (err) {
      console.error('Error converting', file.name, err);
    }
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
