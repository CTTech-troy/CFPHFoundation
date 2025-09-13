(function() {
  const loader = document.getElementById('site-loader');

  const HIDE_STYLE_ID = 'loader-only-style';
  function ensureHideStyle() {
    if (document.getElementById(HIDE_STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = HIDE_STYLE_ID;
    s.textContent = `
      /* When .loader-active is set on body, hide everything except #site-loader */
      body.loader-active > *:not(#site-loader) {
        visibility: hidden !important;
        pointer-events: none !important;
        user-select: none !important;
        opacity: 0 !important;
      }
      /* Ensure loader is visible */
      #site-loader { visibility: visible !important; opacity: 1 !important; }
    `;
    document.head.appendChild(s);
  }

  function showLoader() {
    if (!loader) return;
    ensureHideStyle();
    document.body.classList.add('loader-active');
    loader.style.display = 'flex';
    loader.style.opacity = '1';
    loader.setAttribute('aria-hidden', 'false');
  }

  function hideLoader(immediate = false) {
    if (!loader) return;
    if (immediate) {
      if (loader.parentNode) loader.parentNode.removeChild(loader);
      document.body.classList.remove('loader-active');
      return;
    }
    loader.style.opacity = '0';
    setTimeout(() => {
      if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
      document.body.classList.remove('loader-active');
    }, 350);
  }

  // Loader task manager: register promises for async DB/content loads.
  const tasks = new Map(); // key -> Promise
  let waitingTracker = null;

  function updateTracker() {
    // if already waiting on current batch, let it continue
    if (waitingTracker) return waitingTracker;
    const promises = [...tasks.values()];
    if (promises.length === 0) return null;
    waitingTracker = Promise.allSettled(promises)
      .then(results => {
        // optional: log failures
        const failures = results.filter(r => r.status === 'rejected');
        if (failures.length) {
          console.warn('loader: some tasks failed:', failures);
        }
        tasks.clear();
        waitingTracker = null;
        hideLoader();
      })
      .catch(err => {
        console.error('loader: tracker error', err);
        tasks.clear();
        waitingTracker = null;
        hideLoader();
      });
    return waitingTracker;
  }

  // Public API to register tasks (DB loads). Accepts Promise or async function.
  function registerTask(key, promiseLike) {
    if (!promiseLike) return;
    const p = Promise.resolve(promiseLike);
    tasks.set(key, p);
    // ensure loader is shown while tasks are pending
    showLoader();
    updateTracker();
    return p;
  }

  // Register anonymous promise
  function registerPromise(promiseLike) {
    const key = Symbol('task');
    return registerTask(key, promiseLike);
  }

  // Mark a named task done (useful if you prefer manual control)
  function taskDone(key) {
    if (tasks.has(key)) tasks.delete(key);
    if (tasks.size === 0 && !waitingTracker) hideLoader();
  }

  // Force immediate hide (use with care)
  function forceReady() {
    tasks.clear();
    waitingTracker = null;
    hideLoader();
  }

  // Expose the API
  window.loaderManager = {
    registerTask,
    registerPromise,
    taskDone,
    forceReady,
    isActive: () => document.body.classList.contains('loader-active')
  };

  // Backwards-compatible functions
  window.appShowLoader = showLoader;
  window.appHideLoader = hideLoader;
  window.appReady = forceReady;

  // Show loader if present at script run
  if (loader) {
    showLoader();
  }

  // Safety fallback: if no tasks registered and timeout reached, hide loader
  const SAFETY_TIMEOUT_MS = 30000; // 30s
  setTimeout(() => {
    if (document.getElementById('site-loader')) {
      // only hide when tasks still pending after long timeout
      if (tasks.size === 0) hideLoader();
      else console.warn('loader: safety timeout reached with pending tasks', tasks.size);
    }
  }, SAFETY_TIMEOUT_MS);

  // Optional: also hide on window load if nothing registered
  window.addEventListener('load', function() {
    if (tasks.size === 0) {
      setTimeout(() => hideLoader(), 200);
    }
  });
})();