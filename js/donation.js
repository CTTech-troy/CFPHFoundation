document.addEventListener('DOMContentLoaded', function() {
  const donationCards = document.querySelectorAll('.donation-card');
  const monthlyBtn = document.getElementById('monthly-btn');
  const onetimeBtn = document.getElementById('onetime-btn');
  const usdBtn = document.getElementById('usd-btn');
  const ngnBtn = document.getElementById('ngn-btn');
  const transferBtn = document.getElementById('transfer-btn');
  const transferModal = document.getElementById('transfer-modal');
  const closeModal = document.getElementById('close-modal');
  const paymentMethods = document.querySelectorAll('.payment-method');
  const copyBtn = document.querySelector('.copy-btn');
  const donateAnchor = document.querySelector('a[data-readdy]');
  const donorModal = document.getElementById('donor-modal');
  const donorForm = document.getElementById('donor-form');
  let currentCurrency = 'USD';
  const exchangeRate = 1200; // NGN per USD fallback

  // ensure the custom amount input has an id for other scripts to use
  const customInput = document.querySelector('#custom-amount-section input[type="number"]') || document.querySelector('#donate input[type="number"]');
  if (customInput && !customInput.id) customInput.id = 'custom-amount';

  const customCard = document.getElementById('custom-amount-card');
  const customSection = document.getElementById('custom-amount-section');

  function showCustomSection() {
    if (customSection) customSection.style.display = 'block';
    if (customInput) {
      customInput.focus();
      customInput.select && customInput.select();
    }
  }
  function hideCustomSection() {
    if (customSection) customSection.style.display = 'none';
    if (customInput) customInput.value = customInput.value; // keep value; no-op to be explicit
  }

  // click a donation card: select + open donor modal with display
  donationCards.forEach(card => {
    card.addEventListener('click', function() {
      donationCards.forEach(c => c.classList.remove('selected'));
      this.classList.add('selected');

      // if custom card clicked -> show custom input section and focus it
      if (this.id === 'custom-amount-card') {
        showCustomSection();
        return; // don't open donor modal yet — user should enter custom amount then hit Donate
      }

      // other preset cards -> hide custom section, clear custom input, open modal with preset amount
      hideCustomSection();
      if (customInput) customInput.value = '';
      openDonorModalWithAmount(this.getAttribute('data-amount'));
    });
  });

  // if user types into custom input, mark custom card selected so Donate uses it
  if (customInput) {
    customInput.addEventListener('input', function() {
      donationCards.forEach(c => c.classList.remove('selected'));
      if (customCard) customCard.classList.add('selected');
    });
  }
  
  function openDonorModalWithAmount(baseAmountStr) {
    const base = Number(baseAmountStr) || 0; // data-amount is base USD amount
    const display = currentCurrency === 'USD' ? base : base * exchangeRate;
    const symbol = currentCurrency === 'USD' ? '$' : '₦';
    if (!donorModal) return;
    // insert or update display element inside donor modal
    let disp = donorModal.querySelector('#donation-amount-display');
    if (!disp) {
      disp = document.createElement('div');
      disp.id = 'donation-amount-display';
      disp.className = 'mb-3 text-lg font-semibold text-primary';
      const formTop = donorForm && donorForm.firstElementChild ? donorForm.firstElementChild : donorModal.querySelector('h3');
      if (formTop && formTop.parentNode) formTop.parentNode.insertBefore(disp, formTop.nextSibling);
    }
    disp.textContent = `${symbol}${display.toLocaleString()} (${currentCurrency})`;
    donorModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    // focus first field
    const first = donorModal.querySelector('input, textarea, button');
    if (first) first.focus();
  }

  function closeDonorModal() {
    if (!donorModal) return;
    donorModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }

  // Donate anchor opens modal showing either selected card amount or custom input
  if (donateAnchor) {
    donateAnchor.addEventListener('click', function(e) {
      e.preventDefault();

      const card = document.querySelector('.donation-card.selected');
      const isCustom = card && card.id === 'custom-amount-card';
      let displayAmount = 0;
      const symbol = currentCurrency === 'USD' ? '$' : '₦';

      // Preset cards store base USD in data-amount and must be converted when NGN selected.
      if (card && !isCustom && card.getAttribute('data-amount')) {
        const base = Number(card.getAttribute('data-amount')) || 0;
        displayAmount = (currentCurrency === 'USD') ? base : Math.round(base * exchangeRate);
      } else if ((isCustom || !card) && customInput && customInput.value) {
        // Custom input is entered in the currently selected currency (no conversion).
        displayAmount = Number(customInput.value) || 0;
      } else {
        displayAmount = 0;
      }

      // nicely formatted string
      const displayStr = `${symbol}${displayAmount.toLocaleString()}`;

      const openTransferModal = () => {
        if (transferModal) {
          transferModal.classList.remove('hidden');
          document.body.style.overflow = 'hidden';
          // prefills transfer amount input if present
          const transferAmountInput = document.querySelector('#transfer-form input[name="amount"], #transfer-amount');
          if (transferAmountInput) transferAmountInput.value = displayAmount;
        }
      };

      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'info',
          title: 'We accept bank transfer only',
          html: `Please use bank transfer to complete your donation.<br><strong>Suggested amount:</strong> ${displayStr}`,
          showCancelButton: true,
          confirmButtonText: 'Transfer Now',
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#16a34a'
        }).then(result => {
          if (result.isConfirmed) openTransferModal();
        });
      } else {
        if (confirm(`We accept bank transfer only.\nSuggested amount: ${displayStr}\nOpen transfer instructions?`)) {
          openTransferModal();
        }
      }
    });
  }

  // handle transfer form submission (shows success and closes modal)
  const transferForm = document.getElementById('transfer-form');
  if (transferForm) {
    transferForm.addEventListener('submit', function(e) {
      e.preventDefault();
      // read some fields for the success message if present
      const name = transferForm.querySelector('input[name="name"]')?.value || '';
      const amountVal = transferForm.querySelector('input[name="amount"]')?.value || '';

      const successMsg = name
        ? `Thank you ${name}. Your transfer of ${amountVal} has been recorded.`
        : `Your transfer of ${amountVal} has been recorded.`;

      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'success',
          title: 'Transfer recorded',
          text: successMsg,
          confirmButtonColor: '#16a34a'
        }).then(() => {
          transferModal && transferModal.classList.add('hidden');
          document.body.style.overflow = 'auto';
          transferForm.reset();
        });
      } else {
        alert(successMsg);
        transferModal && transferModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        transferForm.reset();
      }
    });
  }

  // monthly / onetime toggles (guard nulls)
  if (monthlyBtn && onetimeBtn) {
    // update UI and the custom amount label depending on selected donation type
    function setDonationType(isMonthly) {
      if (isMonthly) {
        monthlyBtn.classList.add('bg-primary', 'text-white');
        monthlyBtn.classList.remove('text-gray-600');
        onetimeBtn.classList.remove('bg-primary', 'text-white');
        onetimeBtn.classList.add('text-gray-600');
        // update all occurrences (page currently uses duplicate IDs) to "Monthly"
        document.querySelectorAll('#custom-amount-text').forEach(el => el.textContent = 'Monthly');
        window.__donationIsMonthly = true;
      } else {
        monthlyBtn.classList.remove('bg-primary', 'text-white');
        monthlyBtn.classList.add('text-gray-600');
        onetimeBtn.classList.add('bg-primary', 'text-white');
        onetimeBtn.classList.remove('text-gray-600');
        // update all occurrences (page currently uses duplicate IDs) to "One-time"
        document.querySelectorAll('#custom-amount-text').forEach(el => el.textContent = 'One-time');
        window.__donationIsMonthly = false;
      }
    }

    monthlyBtn.addEventListener('click', function() { setDonationType(true); });
    onetimeBtn.addEventListener('click', function() { setDonationType(false); });

    // Initialize state (respect existing markup if monthly already styled, otherwise default to monthly)
    const initiallyMonthly = monthlyBtn.classList.contains('bg-primary') || !onetimeBtn.classList.contains('bg-primary');
    setDonationType(initiallyMonthly);
  }

  // currency buttons
  if (usdBtn && ngnBtn) {
    usdBtn.addEventListener('click', function() {
      usdBtn.classList.add('bg-primary', 'text-white');
      usdBtn.classList.remove('text-gray-600');
      ngnBtn.classList.remove('bg-primary', 'text-white');
      ngnBtn.classList.add('text-gray-600');
      currentCurrency = 'USD';
      updateDonationAmounts('USD');
    });
    ngnBtn.addEventListener('click', function() {
      ngnBtn.classList.add('bg-primary', 'text-white');
      ngnBtn.classList.remove('text-gray-600');
      usdBtn.classList.remove('bg-primary', 'text-white');
      usdBtn.classList.add('text-gray-600');
      currentCurrency = 'NGN';
      updateDonationAmounts('NGN');
    });
  }

  // New/changed code: implement amount updates and force-only-transfer payment method

  // convert and update visible donation amount labels (data-amount is treated as base USD)
  function updateDonationAmounts(currency) {
    const cards = document.querySelectorAll('.donation-card');
    cards.forEach(card => {
      const amountEl = card.querySelector('.donation-amount');
      if (!amountEl) return;
      // keep "Custom" label for the custom card
      if (card.id === 'custom-amount-card') {
        amountEl.textContent = 'Custom';
        return;
      }
      const base = Number(card.getAttribute('data-amount')) || 0;
      const displayValue = currency === 'USD' ? base : Math.round(base * exchangeRate);
      const symbol = currency === 'USD' ? '$' : '₦';
      amountEl.textContent = `${symbol}${displayValue.toLocaleString()}`;
    });

    // update the small currency symbol in the custom input if present
    const customSectionSymbol = document.querySelector('#custom-amount-section span');
    if (customSectionSymbol) {
      customSectionSymbol.textContent = currency === 'USD' ? '$' : '₦';
    }
  }

  // Hide Card and Google Pay UI elements and ensure only Bank Transfer is available
  (function enforceTransferOnly() {
    const cardBtn = document.getElementById('card-btn');
    const googlePayBtn = document.getElementById('google-pay-btn');
    const transferOnly = document.getElementById('transfer-btn');

    // hide other payment buttons (visual removal)
    if (cardBtn) cardBtn.style.display = 'none';
    if (googlePayBtn) googlePayBtn.style.display = 'none';

    // Recompute the list of paymentMethod handlers to only include visible ones (transfer)
    // Replace the global paymentMethods NodeList usage by a filtered list where needed below.
    // (We keep existing paymentMethods variable untouched in-place; handlers below will use filtered list.)
    window.__availablePaymentMethods = Array.from(document.querySelectorAll('.payment-method'))
      .filter(el => el && getComputedStyle(el).display !== 'none');

    // Make transfer selected by default if it's present
    if (transferOnly) {
      // remove selection styles from others (defensive)
      Array.from(document.querySelectorAll('.payment-method')).forEach(m => {
        m.classList.remove('bg-primary', 'text-white');
        m.classList.add('hover:border-primary');
      });
      transferOnly.classList.add('bg-primary', 'text-white');
      transferOnly.classList.remove('hover:border-primary');

      // ensure transfer modal is ready to open if clicked
      transferOnly.addEventListener('click', function () {
        const transferModal = document.getElementById('transfer-modal');
        transferModal && transferModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      });
    }
  })();

  // payment methods - use the filtered available list to attach click handlers (only transfer remains)
  const availablePaymentMethods = window.__availablePaymentMethods || Array.from(document.querySelectorAll('.payment-method')).filter(el => el && getComputedStyle(el).display !== 'none');
  availablePaymentMethods.forEach(method => {
    method.addEventListener('click', function() {
      availablePaymentMethods.forEach(m => {
        m.classList.remove('bg-primary', 'text-white');
        m.classList.add('hover:border-primary');
      });
      this.classList.add('bg-primary', 'text-white');
      this.classList.remove('hover:border-primary');

      // open transfer modal only for transfer (we only have transfer visible)
      if (this.id === 'transfer-btn') {
        transferModal && transferModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      } else {
        transferModal && transferModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
      }
    });
  });

  // close transfer modal
  if (closeModal) {
    closeModal.addEventListener('click', function() {
      transferModal.classList.add('hidden');
      document.body.style.overflow = 'auto';
    });
  }
  if (transferModal) {
    transferModal.addEventListener('click', function(e) {
      if (e.target === transferModal) {
        transferModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
      }
    });
  }

  // copy button safe guard
  if (copyBtn) {
    copyBtn.addEventListener('click', function() {
      const accountNumber = '1028535101';
      navigator.clipboard.writeText(accountNumber).then(() => {
        const icon = this.querySelector('i');
        if (icon) {
          icon.classList.remove('ri-file-copy-line');
          icon.classList.add('ri-check-line');
          setTimeout(() => {
            icon.classList.remove('ri-check-line');
            icon.classList.add('ri-file-copy-line');
          }, 2000);
        }
      });
    });
  }

  // close donor modal (Cancel)
  const closeDonorBtn = document.getElementById('close-donor-modal');
  if (closeDonorBtn) closeDonorBtn.addEventListener('click', function(e) {
    e.preventDefault();
    closeDonorModal();
  });

  // keep rest of DOMContentLoaded handlers intact...
  // initial render of donation amounts
  updateDonationAmounts(currentCurrency);
});
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href') || '';
      // ignore plain '#' or empty hrefs
      if (!href || href === '#') {
        e.preventDefault();
        return;
      }
      // only attempt querySelector for valid fragment selectors like '#id'
      if (href.startsWith('#') && href.length > 1) {
        try {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        } catch (err) {
          console.warn('Invalid fragment selector, skipping smooth scroll:', href, err);
        }
      }
    });
  });
  
  const donateNavBtn = document.getElementById('donate-nav-btn');
  if (donateNavBtn) {
    donateNavBtn.addEventListener('click', function() {
      const donateSection = document.getElementById('donate');
      if (donateSection) {
        donateSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  }
});

// ensure showError safely accepts event
function showError(event) {
  if (event && typeof event.preventDefault === 'function') event.preventDefault();
  Swal.fire({
    icon: 'error',
    title: 'Transfer Error',
    text: 'Transaction could not be processed. Please try again or make use of the transfer details provided.',
    confirmButtonColor: '#16a34a' // green confirm button
  });
}

