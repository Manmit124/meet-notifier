// background.js
const MEET_URL_PATTERN = 'https://meet.google.com/';
const activeMeetTabs = new Set();
let lastNotifiedStatus = new Map();

// Track Meet tabs
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && tab.url.includes(MEET_URL_PATTERN)) {
    activeMeetTabs.add(tabId);
    
    // Inject content script to start monitoring
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }).catch(console.error);
  }
});

// Remove tab from traing when closed
chrome.tabs.onRemoved.addListener((tabId) => {
  activeMeetTabs.delete(tabId);
  lastNotifiedStatus.delete(tabId);
});

// Listen for participant change messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'participantStatusChange' && sender.tab) {
    const tabId = sender.tab.id;
    const currentStatus = message.status;
    const lastStatus = lastNotifiedStatus.get(tabId);

    // Check if status has changed and is not 'No one else is here'
    if (currentStatus !== lastStatus && currentStatus !== 'No one else is here') {
      // Create desktop notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: 'Google Meet Notification',
        message: `Participant Update: ${currentStatus}`,
        priority: 2
      });

      // Update last notified status
      lastNotifiedStatus.set(tabId, currentStatus);
    }

    sendResponse({ received: true });
  }
  return true; // Allow async response
});

// Periodically check active Meet tabs
function checkActiveMeetTabs() {
  for (const tabId of activeMeetTabs) {
    chrome.tabs.sendMessage(tabId, { action: 'checkParticipants' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        activeMeetTabs.delete(tabId);
      }
    });
  }
}

// Set up periodic checking
chrome.alarms.create('checkMeetTabs', { periodInMinutes: 0.1 }); // Every 6 seconds

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkMeetTabs') {
    checkActiveMeetTabs();
  }
});