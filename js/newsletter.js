// Import the Firebase Realtime Database instance
import { rtdb } from '../js/firebase.js';
import { ref, push } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js';

// Newsletter elements
const emailInput = document.getElementById('newsletter-email');
const subscribeBtn = document.getElementById('newsletter-btn');

// Remind Me button
const remindMeBtn = document.getElementById('reminder-badge');

// Function to show a toast notification
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.className = `fixed top-5 right-5 px-4 py-2 rounded-lg shadow-lg text-white z-50
    ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} transition-opacity duration-500`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

// Subscribe button logic
subscribeBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();

  if (!email || !email.includes('@')) {
    showToast('Please enter a valid email address.', 'error');
    return;
  }

  // Change button text to show progress
  subscribeBtn.textContent = "Subscribing";
  subscribeBtn.disabled = true;

  let dotCount = 0;
  const interval = setInterval(() => {
    dotCount = (dotCount + 1) % 4;
    subscribeBtn.textContent = "Subscribing" + ".".repeat(dotCount);
  }, 500);

  try {
    const newsletterRef = ref(rtdb, 'newsletterSubscribers');
    await push(newsletterRef, {
      email: email,
      subscribedAt: new Date().toISOString()
    });

    clearInterval(interval);
    subscribeBtn.textContent = "Subscribed!";
    emailInput.value = "";
    showToast('Thank you for subscribing!');
  } catch (error) {
    console.error('Error saving email:', error);
    clearInterval(interval);
    subscribeBtn.textContent = "Subscribe";
    showToast('Failed to subscribe. Please try again.', 'error');
  } finally {
    subscribeBtn.disabled = false;
  }
});

// Remind Me button logic
remindMeBtn.addEventListener('click', async () => {
  try {
    const reminderRef = ref(rtdb, 'eventReminders');
    await push(reminderRef, {
      reminderSetAt: new Date().toISOString()
    });

    showToast('Reminder set! We’ll notify you about this event.');
  } catch (error) {
    console.error('Error setting reminder:', error);
    showToast('Failed to set reminder. Please try again.', 'error');
  }
});
