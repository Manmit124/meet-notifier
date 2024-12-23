
// popup.js
document.addEventListener('DOMContentLoaded', async () => {
  const meetingsDiv = document.getElementById('meetings');
  
  // Get active meetings from background script
  chrome.runtime.sendMessage({ type: 'getMeetings' }, (response) => {
    if (!response || !response.meetings || response.meetings.length === 0) {
      meetingsDiv.innerHTML = '<p>No active meetings</p>';
      return;
    }

    meetingsDiv.innerHTML = response.meetings.map(meeting => `
      <div class="meeting">
        <div class="meeting-url">${meeting.url}</div>
        <div class="status">${meeting.lastStatus}</div>
      </div>
    `).join('');
  });
});