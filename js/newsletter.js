// Import the Firebase Realtime Database instance
import { rtdb } from '../js/firebase.js';
import { ref, push } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js';

// Toast helper
function showToast(message, type = 'success') {
  console.log('toast:', message, type);
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.className = `fixed top-5 right-5 px-4 py-2 rounded-lg shadow-lg text-white z-50
    ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`;
  // ensure visible and animatable
  toast.style.opacity = '1';
  toast.style.transition = 'opacity 0.5s ease';
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

// Loading state helper for a button
function setButtonLoading(btn, loading, label = 'Subscribe') {
  if (!btn) return;
  if (loading) {
    btn._origText = btn.textContent;
    btn.disabled = true;
    let dots = 0;
    btn.textContent = label;
    btn._interval = setInterval(() => {
      dots = (dots + 1) % 4;
      btn.textContent = label + '.'.repeat(dots);
    }, 400);
  } else {
    if (btn._interval) {
      clearInterval(btn._interval);
      btn._interval = null;
    }
    btn.disabled = false;
    btn.textContent = btn._origText || label;
  }
}
// Find nearest email input for a given button (search up the DOM then fallback to common IDs)
function findEmailInputForButton(btn) {
  if (!btn) return null;
  // search inside the same form/container
  let container = btn.closest('form, #newsletter-form, #newsletter-form, .space-y-2, .bg-primary\\\/10, .bg-primary');
  if (!container) container = btn.parentElement;
  if (container) {
    const input = container.querySelector('input[type="email"], input[placeholder], input');
    if (input) return input;
  }
  // fallback by known IDs used in the page (may be duplicated)
  const byId = document.querySelector('#footer-newsletter-email') || document.querySelector('#newsletter-email') || document.querySelector('input[type="email"]');
  return byId || null;
}

// Save email to RTDB and return the promise (resolve to an object with the generated key)
function saveEmailToDb(email) {
  const newsletterRef = ref(rtdb, 'newsletterSubscribers');
  return push(newsletterRef, {
    email: email,
    subscribedAt: new Date().toISOString()
  }).then((res) => {
    // res is a ThenableReference; key may be in .key (or .name depending on SDK)
    const key = res && (res.key || res.name) ? (res.key || res.name) : null;
    return { key, ref: res };
  });
}

// Attach listeners to all newsletter subscribe buttons on the page
function wireNewsletterButtons() {
  // selectors used in index.html and possible duplicates
  const btnSelectors = [
    '#footer-newsletter-btn',
    '#newsletter-btn',
    '[data-newsletter-btn]',
    'button:contains("Subscribe")' // fallback - not supported by querySelectorAll, kept for reference
  ];

  // collect buttons: target both exact IDs and any button inside newsletter-form containers
  const buttons = new Set();

  document.querySelectorAll('#footer-newsletter-btn, #newsletter-btn, [data-newsletter-btn], #newsletter-form button, #newsletter-form [type="button"], #newsletter-form [type="submit"]').forEach(b => buttons.add(b));

  // also try to find buttons by text fallback
  document.querySelectorAll('button').forEach(b => {
    const txt = (b.textContent || '').trim().toLowerCase();
    if (txt === 'subscribe' || txt.startsWith('subscribe')) buttons.add(b);
  });

  if (!buttons.size) {
    console.warn('newsletter: no subscribe buttons found');
    return;
  }

  buttons.forEach(btn => {
    // avoid double-binding
    if (btn._newsletterBound) return;
    btn._newsletterBound = true;

    btn.addEventListener('click', async (e) => {
      e.preventDefault();

      const input = findEmailInputForButton(btn);
      if (!input) {
        showToast('Email input not found on the page.', 'error');
        return;
      }

      const raw = (input.value && input.value.trim()) || (input.placeholder && input.placeholder.trim()) || '';
      const email = raw;

      if (!email || !email.includes('@')) {
        showToast('Please enter a valid email address.', 'error');
        // focus the input for convenience
        try { input.focus(); } catch (e) {}
        return;
      }

      setButtonLoading(btn, true, 'Subscribing');

      // create the DB promise
      const dbPromise = saveEmailToDb(email);

      // if loaderManager exists, register the promise so the global loader stays until done
      if (window.loaderManager && typeof window.loaderManager.registerPromise === 'function') {
        try {
          window.loaderManager.registerPromise(dbPromise);
        } catch (err) {
          // continue even if registration fails
          console.warn('newsletter: loaderManager.registerPromise failed', err);
        }
      }

      try {
        // wait for DB write and get back the generated id
        const result = await dbPromise;
        setButtonLoading(btn, false);
        if (result && result.key) {
          showToast(`Subscribed — id: ${result.key}`, 'success');
        } else {
          showToast('Thank you for subscribing!', 'success');
        }
        // clear input only if it was typed (not placeholder)
        if (input.value) input.value = '';
      } catch (err) {
        console.error('Error saving email:', err);
        setButtonLoading(btn, false);
        showToast('Failed to subscribe. Please try again.', 'error');
      }
    });
  });
}

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', wireNewsletterButtons);
} else {
  wireNewsletterButtons();
}

// Remind Me button logic (guarded)
const remindMeBtn = document.getElementById('reminder-badge');
if (remindMeBtn) {
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
} else {
  // no reminder badge is fine
}
