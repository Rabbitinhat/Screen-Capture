let overlayVisiblity = false;
let overlayElement;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'ShowOverlay' && !overlayVisiblity) {
    showOverlay();
    overlayVisiblity = true;
  } else if (message.action === 'HideOverlay' && overlayVisiblity) {
    hideOverlay();
    overlayVisiblity = false;
  } else if (message.action === 'ExecuteScript'){
    const { dataUrl, x, y, width, height } = message;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    const image = new Image();
    image.onload = () => {
      context.drawImage(image, x, y, width, height, 0, 0, width, height);
      // const dataUrl = canvas.toDataURL();
      // const blob = dataURLToBlob(dataUrl);
      // const blobUrl = URL.createObjectURL(blob)
      // chrome.runtime.sendMessage({ action: 'DownloadMHTML', blobUrl });
      canvas.toBlob(blob => {
        const blobUrl = URL.createObjectURL(blob);
        chrome.runtime.sendMessage({ action: 'DownloadMHTML', blobUrl });
      }, 'image/png')
    };
    image.src = dataUrl;
  }
});

function dataURLToBlob(dataURL) {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

function showOverlay() {
  overlayElement = document.createElement('div');
  overlayElement.style.position = 'fixed';
  overlayElement.style.top = '0';
  overlayElement.style.left = '0';
  overlayElement.style.width = '100%';
  overlayElement.style.height = '100%';
  overlayElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  overlayElement.style.zIndex = '9999';
  overlayElement.style.cursor = 'crosshair';

    let startX, startY;
    let rect

    const onMouseDown = (event) => {
      if(rect && overlayElement.hasChildNodes(rect)){
        overlayElement.removeChild(rect)
      }

      startX = event.clientX 
      startY = event.clientY

      rect = document.createElement('div')
      rect.style.position = "fixed";
      rect.style.left = `${startX}px`;
      rect.style.top = `${startY}px`;
      rect.style.width = "0";
      rect.style.height = "0";
      rect.style.outline = "2px dashed #ccc";
      // rect.style.boxSizing = "border-box";
      rect.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
      rect.style.pointerEvents = "none";

      overlayElement.appendChild(rect)

      const onMouseMove = (event) => {
        
        const currentX = event.clientX;
        const currentY = event.clientY;

        const width = currentX - startX;
        const height = currentY - startY;

        rect.style.width = `${Math.abs(width)}px`
        rect.style.height = `${Math.abs(height)}px`

        if (width < 0) {
          rect.style.left = `${currentX}px`
        }

        if (height < 0) {
          rect.style.top = `${currentY}px`
        }
      }

      const onMouseUp = () => {
        overlayElement.removeEventListener('mousemove', onMouseMove)
        overlayElement.removeEventListener('mouseup', onMouseUp)

        const rectBounds = rect.getBoundingClientRect();
        const x = rectBounds.left;
        const y = rectBounds.top;
        const width = rectBounds.width;
        const height = rectBounds.height;

        alert('goto CaptureContent')
        chrome.runtime.sendMessage({ action: 'CaptureContent', x, y, width, height })

      }


      overlayElement.addEventListener('mousemove', onMouseMove)
      overlayElement.addEventListener('mouseup', onMouseUp)
    }

    overlayElement.addEventListener('mousedown', onMouseDown)

    document.body.appendChild(overlayElement);

}

function hideOverlay() {
  if (overlayElement && overlayElement.parentNode) {
    overlayElement.parentNode.removeChild(overlayElement);
  }
}