

// content.js
(() => {
  let previousStatus = 'No one else is here';

  function checkParticipantStatus() {
    try {
      // Multiple selectors to improve reliability
      const statusElements = [
        document.querySelector('.sCzCRe [role="status"].tJifFd'),
        document.querySelector('[data-participant-count]'),
        document.querySelector('.K5aBye') // Alternative participant indicator
      ];

      const statusElement = statusElements.find(el => el);
      
      if (statusElement) {
        let currentStatus = '';
        
        // Different extraction methods based on element type
        if (statusElement.hasAttribute('data-participant-count')) {
          const count = statusElement.getAttribute('data-participant-count');
          currentStatus = `${count} participant(s) in the meeting`;
        } else {
          currentStatus = statusElement.textContent.trim();
        }

        // Only send if status has changed and is meaningful
        if (currentStatus && currentStatus !== previousStatus && currentStatus !== 'No one else is here') {
          chrome.runtime.sendMessage({
            type: 'participantStatusChange',
            status: currentStatus
          });
          previousStatus = currentStatus;
        }
      }
    } catch (error) {
      console.error('Error checking participant status:', error);
    }
  }

  // Initial check
  checkParticipantStatus();

  // Periodic checking
  const statusCheckInterval = setInterval(checkParticipantStatus, 5000);

  // Message listener for manual checks
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'checkParticipants') {
      checkParticipantStatus();
      sendResponse({ checked: true });
    }
  });

  // Cleanup on page unload
  window.addEventListener('unload', () => {
    clearInterval(statusCheckInterval);
  });
})();