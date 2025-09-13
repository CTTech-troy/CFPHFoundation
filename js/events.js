import { rtdb } from './firebase.js';
import { ref, get, set, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Fetch and render events
async function fetchevents() {
  try {
    const eventsRef = ref(rtdb, "EventsManager");
    const snapshot = await get(eventsRef);

    if (snapshot.exists()) {
      const events = snapshot.val();
      renderEvents(events);
    } else {
      console.log("No events available.");
    }
  } catch (error) {
    console.error("Error fetching events:", error);
  }
}

// Render events in the UI
function renderEvents(events) {
  const container = document.querySelector('.space-y-12');
  container.innerHTML = ''; // clear previous content

  Object.keys(events).forEach(eventId => {
    const event = events[eventId];
    const reminderCount = event.reminderCount || 0;

    // Check if user has clicked this reminder
    const userClicked = localStorage.getItem(`reminder_${eventId}`) === 'true';

    const eventHTML = document.createElement('div');
    eventHTML.classList.add('flex', 'justify-center', 'items-center');
    eventHTML.innerHTML = `
      <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl relative">
        <div class="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full top-0"></div>
        <div class="text-center">
          <div class="text-2xl font-bold text-primary mb-2">${event.title}</div>
          <div class="text-xl font-semibold text-secondary mb-4">${event.date}</div>
          <div class="flex justify-center items-center space-x-6 text-gray-600 mb-6">
            <div class="flex items-center"><i class="ri-time-line mr-2"></i><span>${event.time}</span></div>
            <div class="flex items-center"><i class="ri-map-pin-line mr-2"></i><span>${event.location}</span></div>
          </div>
          <button id="remind-me-now" class="reminder-btn bg-primary text-white px-6 py-3 !rounded-button font-semibold hover:bg-green-600 transition-colors whitespace-nowrap" ${userClicked ? 'disabled' : ''}>
            <i class="ri-notification-line mr-2"></i>
            Set Reminder (${reminderCount})
          </button>
        </div>
      </div>
    `;
    
    // Add click event
    const btn = eventHTML.querySelector('.reminder-btn');
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      localStorage.setItem(`reminder_${eventId}`, 'true');

      // Open the existing reminder modal and prefill fields
      (function openReminderModal(prefill = {}) {
        const modal = document.getElementById('reminder-modal');
        if (!modal) return;
        const titleEl = document.getElementById('reminder-title');
        const nameEl = document.getElementById('reminder-name');
        const startEl = document.getElementById('reminder-start');
        const locationEl = document.getElementById('reminder-location');
        const usefulBtn = document.getElementById('reminder-useful');

        if (titleEl) titleEl.value = prefill.title || 'CFPHF';
        if (nameEl) nameEl.value = prefill.name || prefill.title || 'CFPHF';
        if (locationEl) locationEl.value = prefill.location || '';

        // If event has a parsable date/time try to prefill start
        if (startEl) {
          if (prefill.start) {
            const dt = new Date(prefill.start);
            if (!isNaN(dt)) startEl.value = dt.toISOString().slice(0,16);
          } else {
            const dt = new Date(Date.now() + 3600 * 1000);
            startEl.value = dt.toISOString().slice(0,16);
          }
        }

        if (usefulBtn) usefulBtn.classList.remove('hidden');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
        const first = modal.querySelector('input');
        if (first) first.focus();
      })({
        title: event.title,
        name: event.title,
        location: event.location,
        // try to combine date/time if available; leave undefined if not parseable
        start: (event.date ? event.date : '') + (event.time ? ' ' + event.time : '')
      });

      // Update reminder count in Firebase
      try {
        const newCount = reminderCount + 1;
        await update(ref(rtdb, `EventsManager/${eventId}`), { reminderCount: newCount });
        btn.innerHTML = `<i class="ri-notification-line mr-2"></i>Set Reminder (${newCount})`;
      } catch (error) {
        console.error('Error updating reminder count:', error);
      }
    });

    container.appendChild(eventHTML);
  });
}

// Call the function
fetchevents();
