// monnify.js

// === Configuration ===
const MONNIFY_PUBLIC_KEY = (window.__ENV && window.__ENV.MONNIFY_PUBLIC_KEY) ? window.__ENV.MONNIFY_PUBLIC_KEY.trim() : "MK_TEST_VVBJX8S6RQ";
const CONTRACT_CODE = (window.__ENV && window.__ENV.CONTRACT_CODE) ? window.__ENV.CONTRACT_CODE.trim() : "4938241077";
const DONATION_DESCRIPTION = "Charity Donation";

let cachedExchangeRate = 1200; // fallback
const SDK_SRC = "https://sdk.monnify.com/plugin/monnify.js";

// prevent duplicate submissions / reused references
let isProcessingDonation = false;

// safe loader for Monnify SDK
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (window.MonnifySDK) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = (e) => reject(new Error('Failed to load ' + src));
    document.head.appendChild(s);
  });
}

// attempt to fetch exchange rate (non-blocking)
async function fetchExchangeRate() {
  return cachedExchangeRate;
}
fetchExchangeRate();

// Utility: read the current selected currency from DOM
function readSelectedCurrency() {
  const usdBtn = document.getElementById('usd-btn');
  const ngnBtn = document.getElementById('ngn-btn');
  if (usdBtn && usdBtn.classList.contains('bg-primary')) return 'USD';
  if (ngnBtn && ngnBtn.classList.contains('bg-primary')) return 'NGN';
  return 'USD';
}

// Utility: read selected amount (card selected or custom input)
// Returns the numeric amount in the currently selected currency (not converted to NGN)
function readSelectedAmount() {
  // first check for selected card
  const selectedCard = document.querySelector('.donation-card.selected');
  const currency = readSelectedCurrency();

  // If the selected card is the custom card, read the custom input value as-is
  if (selectedCard && selectedCard.id === 'custom-amount-card') {
    const customInput = document.getElementById('custom-amount') || document.querySelector('#custom-amount-section input[type="number"]');
    if (customInput) {
      return Number(customInput.value) || 0; // exact value in selected currency
    }
    return 0;
  }

  // Preset card selected: data-amount in markup is base USD value
  if (selectedCard) {
    const baseUsd = Number(selectedCard.getAttribute('data-amount')) || 0;
    // return amount in currently selected currency (USD or NGN)
    return (currency === 'USD') ? baseUsd : baseUsd * (cachedExchangeRate || 1200);
  }

  // fallback: read custom input (user typed a number)
  const customInput = document.getElementById('custom-amount') || document.querySelector('#donate input[type="number"]');
  if (customInput) {
    return Number(customInput.value) || 0; // exact value in selected currency
  }

  return 0;
}

// Utility: read selected payment method from UI
function readSelectedPaymentMethod() {
  const btn = document.querySelector('.payment-method.bg-primary, .payment-method.text-white.bg-primary');
  if (!btn) return 'card';
  if (btn.id === 'google-pay-btn') return 'google-pay';
  return 'card';
}

// Utility: returns display and converted amounts
function getDisplayAmounts() {
  const displayCurrency = readSelectedCurrency();
  const displayAmountRaw = readSelectedAmount() || 0;
  const rate = cachedExchangeRate || 1200;
  const amountForMonnify = displayCurrency === 'USD'
    ? Math.round(displayAmountRaw * rate)
    : Math.round(displayAmountRaw);
  return {
    displayCurrency,
    displayAmountRaw,
    amountForMonnify,
    rate
  };
}

// Update (or create) amount display inside donor modal
function updateDonorModalAmountDisplay() {
  const donorModal = document.getElementById('donor-modal');
  if (!donorModal) return;
  const { displayCurrency, displayAmountRaw, amountForMonnify } = getDisplayAmounts();
  const symbol = displayCurrency === 'USD' ? '$' : '₦';
  const convertedSymbol = '₦'; // Monnify receives NGN in this flow

  let disp = donorModal.querySelector('#donation-amount-display');
  if (!disp) {
    disp = document.createElement('div');
    disp.id = 'donation-amount-display';
    disp.className = 'mb-3 text-lg font-semibold text-primary';
    // Insert after modal title or at top of form
    const formTop = document.getElementById('donor-form')?.firstElementChild || donorModal.querySelector('h3');
    if (formTop && formTop.parentNode) formTop.parentNode.insertBefore(disp, formTop.nextSibling);
    else donorModal.insertBefore(disp, donorModal.firstChild);
  }

  // show original amount + converted NGN amount
  disp.textContent = `${symbol}${Number(displayAmountRaw).toLocaleString()} (${displayCurrency}) — ${convertedSymbol}${Number(amountForMonnify).toLocaleString()}`;
}

// Wire UI interactions to keep modal display in sync
document.addEventListener('DOMContentLoaded', function() {
  // update whenever a preset card is clicked
  document.querySelectorAll('.donation-card').forEach(card => {
    card.addEventListener('click', updateDonorModalAmountDisplay);
  });

  // update while user types custom amount
  const customInput = document.getElementById('custom-amount') || document.querySelector('#custom-amount-section input[type="number"], #donate input[type="number"]');
  if (customInput) {
    customInput.addEventListener('input', updateDonorModalAmountDisplay);
  }

  // update when currency toggles
  const usdBtn = document.getElementById('usd-btn');
  const ngnBtn = document.getElementById('ngn-btn');
  if (usdBtn) usdBtn.addEventListener('click', () => setTimeout(updateDonorModalAmountDisplay, 0));
  if (ngnBtn) ngnBtn.addEventListener('click', () => setTimeout(updateDonorModalAmountDisplay, 0));

  // initial call in case modal exists and values already selected
  updateDonorModalAmountDisplay();
});

// ensure modal display is fresh right before submit / Monnify init
// inside the existing submit handler call updateDonorModalAmountDisplay() before hiding the modal and initializing Monnify
// (the submit handler already exists further down in this file — ensure it contains the following call:)
//
//    // refresh modal display so user sees exact and converted values before closing
//    updateDonorModalAmountDisplay();
//
//    // then hide modal and proceed to load SDK / initialize Monnify
//
// If your submit handler doesn't include that call, add it near the start of the handler (before donorModal.classList.add('hidden')).

document.addEventListener('DOMContentLoaded', function() {
  const donationForm = document.getElementById('donor-form');
  const donorModal = document.getElementById('donor-modal');
  if (!donationForm) return;

  donationForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (isProcessingDonation) {
      alert('A donation is being processed. Please wait.');
      return;
    }

    const name = document.getElementById('donor-name')?.value.trim() || '';
    const email = document.getElementById('donor-email')?.value.trim() || '';
    const message = document.getElementById('donor-message')?.value.trim() || '';

    if (!name || !email) {
      alert('Please provide your name and email.');
      return;
    }

    // inside donor-form submit handler — convert to Monnify amount only if USD was selected
    // (keep this block where you build amountForMonnify)
    const displayCurrency = readSelectedCurrency();
    const displayAmountRaw = readSelectedAmount();
    if (!displayAmountRaw || displayAmountRaw <= 0) {
      alert('Please select or enter a valid donation amount.');
      return;
    }

    // determine amount to send to Monnify: only convert USD -> NGN
    const rate = cachedExchangeRate || 1200;
    let amountForMonnify;
    if (displayCurrency === 'USD') {
      // convert USD to NGN (Monnify expects NGN in this flow)
      amountForMonnify = Math.round(displayAmountRaw * rate);
    } else {
      // already NGN — use exact amount entered
      amountForMonnify = Math.round(displayAmountRaw);
    }

    let selectedPaymentMethod = readSelectedPaymentMethod();

    if (donorModal) {
      donorModal.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }

    if (!MONNIFY_PUBLIC_KEY || !CONTRACT_CODE) {
      console.error('Monnify keys missing. Payment cannot proceed.');
      alert('Payment configuration error. Contact site admin.');
      return;
    }

    try {
      if (!window.MonnifySDK) {
        await loadScript(SDK_SRC);
      }
    } catch (err) {
      console.error('Failed to load Monnify SDK:', err);
      alert('Payment service unavailable. Try again later.');
      return;
    }

    const reference = `DON-${Date.now()}-${Math.random().toString(36).slice(2,10).toUpperCase()}`;

    const options = {
      amount: amountForMonnify,
      currency: 'NGN',
      reference,
      customerName: name,
      customerEmail: email,
      apiKey: MONNIFY_PUBLIC_KEY,
      contractCode: CONTRACT_CODE,
      paymentDescription: `${DONATION_DESCRIPTION} (${displayAmountRaw} ${displayCurrency})`,
      metadata: {
        donorMessage: message,
        originalCurrency: displayCurrency,
        originalAmount: displayAmountRaw,
        paymentMethod: selectedPaymentMethod
      },
      // Remove transfer completely from Monnify model
      paymentMethods: ['CARD', 'USSD', 'PHONE_NUMBER'],
      onComplete: function(response) {
        isProcessingDonation = false;
        console.log('Payment Response:', response);
        if (response && response.paymentReference) {
          alert(`Thank you! You donated ${displayAmountRaw} ${displayCurrency}.`);
          return;
        }
        const msg = (response?.responseMessage || response?.message || '').toString().toLowerCase();
        if (msg.includes('already') && msg.includes('completed')) {
          alert('This transaction was already completed.');
          return;
        }
        alert('Payment was not completed.');
      },
      onClose: function() {
        isProcessingDonation = false;
        console.log('Donation window closed.');
      }
    };

    isProcessingDonation = true;
    try {
      if (window.MonnifySDK?.initialize) {
        window.MonnifySDK.initialize(options);
      } else {
        console.error('MonnifySDK.initialize not available');
        isProcessingDonation = false;
        alert('Payment service not available right now.');
      }
    } catch (err) {
      isProcessingDonation = false;
      console.error('Error initializing Monnify SDK:', err);
      alert('Unable to start payment. See console for details.');
    }
  });
});

// Debugging fetch for Monnify
(function enableMonnifyDebugFetch() {
  if (!window.fetch) return;
  const originalFetch = window.fetch.bind(window);
  window.fetch = async function(input, init) {
    try {
      const url = typeof input === 'string' ? input : input?.url || '';
      if (url && url.includes('/app/transaction/init')) {
        console.info('[Monnify debug] INIT REQUEST', { url, init });
        const res = await originalFetch(input, init);
        const clone = res.clone();
        let text = '';
        try { text = await clone.text(); } catch { text = '<no body>'; }
        console.info('[Monnify debug] INIT RESPONSE', { status: res.status, body: text });
        return res;
      }
    } catch (err) {
      console.warn('[Monnify debug] fetch wrapper error', err);
    }
    return originalFetch(input, init);
  };
})();
