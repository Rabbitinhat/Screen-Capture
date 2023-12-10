window.addEventListener('load', () => {
  document.getElementById('showOverlayButton').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'ShowOverlay' });
  })

  document.getElementById('hideOverlayButton').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'HideOverlay' })
  })
})
