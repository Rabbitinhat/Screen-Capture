chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'ShowOverlay') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log(tabs)
      const tabId = tabs[0].id;
      chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js']
      });
      chrome.tabs.sendMessage(tabId, { action: 'ShowOverlay' })
    });
  } else if (message.action === 'HideOverlay') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;
      chrome.tabs.sendMessage(tabId, { action: 'HideOverlay' })
    })
  } else if (message.action === 'CaptureContent') {
    const { x, y, width, height } = message;
    chrome.tabs.captureVisibleTab({ format: 'png' }, dataUrl => {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tabId = tabs[0].id;
        chrome.tabs.sendMessage(tabId, { action: 'ExecuteScript', dataUrl, x, y, width, height });
      })
    });
  } else if (message.action === 'DownloadMHTML') {
    // const { dataUrl } = message;
    // const blob = dataURLToBlob(dataUrl);
    // const url = URL.createObjectURL(blob);
    const { blobUrl } = message;
    const filename = 'captured_content.mhtml';

    chrome.downloads.download({
      url: blobUrl,
      filename,
      saveAs: true
    });
  }
});

