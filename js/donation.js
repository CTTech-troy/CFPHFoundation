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
      // if a card is selected use it, else use custom input
      const card = document.querySelector('.donation-card.selected');
      if (card) {
        openDonorModalWithAmount(card.getAttribute('data-amount'));
      } else if (customInput && customInput.value) {
        // when custom amount exists interpret it in currentCurrency
        const v = Number(customInput.value) || 0;
        const symbol = currentCurrency === 'USD' ? '$' : '₦';
        let disp = donorModal.querySelector('#donation-amount-display');
        if (!disp) {
          disp = document.createElement('div');
          disp.id = 'donation-amount-display';
          disp.className = 'mb-3 text-lg font-semibold text-primary';
          const formTop = donorForm && donorForm.firstElementChild ? donorForm.firstElementChild : donorModal.querySelector('h3');
          if (formTop && formTop.parentNode) formTop.parentNode.insertBefore(disp, formTop.nextSibling);
        }
        disp.textContent = `${symbol}${v.toLocaleString()} (${currentCurrency})`;
        donorModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      } else {
        // nothing selected — open modal anyway
        openDonorModalWithAmount(0);
      }
    });
  }

  // monthly / onetime toggles (guard nulls)
  if (monthlyBtn && onetimeBtn) {
    monthlyBtn.addEventListener('click', function() {
      monthlyBtn.classList.add('bg-primary', 'text-white');
      monthlyBtn.classList.remove('text-gray-600');
      onetimeBtn.classList.remove('bg-primary', 'text-white');
      onetimeBtn.classList.add('text-gray-600');
    });
    onetimeBtn.addEventListener('click', function() {
      onetimeBtn.classList.add('bg-primary', 'text-white');
      onetimeBtn.classList.remove('text-gray-600');
      monthlyBtn.classList.remove('bg-primary', 'text-white');
      monthlyBtn.classList.add('text-gray-600');
    });
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

  // payment methods
  paymentMethods.forEach(method => {
    method.addEventListener('click', function() {
      paymentMethods.forEach(m => {
        m.classList.remove('bg-primary', 'text-white');
        m.classList.add('hover:border-primary');
      });
      this.classList.add('bg-primary', 'text-white');
      this.classList.remove('hover:border-primary');

      // open transfer modal only for transfer
      if (this.id === 'transfer-btn') {
        transferModal && transferModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      } else {
        // if card or google-pay selected, keep selection and close transfer modal if open
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

