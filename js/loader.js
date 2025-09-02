(function() {
  const loader = document.getElementById('site-loader');

  function hideLoader(immediate = false) {
    if (!loader) return;
    if (immediate) {
      loader.classList.add('hidden');
      return;
    }
    // smooth fade then remove
    loader.style.opacity = '0';
    setTimeout(() => {
      if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
    }, 350);
  }

  // Automatically hide after full window load (fallback)
  window.addEventListener('load', function() {
    // slight delay so late-running tasks show the loader briefly
    setTimeout(() => hideLoader(), 200);
  });

  // public API: call when your app/data is ready
  window.appReady = function() { hideLoader(); };

  // optional early show/hide controls for other scripts
  window.appShowLoader = function() {
    if (!loader) return;
    loader.classList.remove('hidden');
    loader.style.opacity = '1';
  };
  window.appHideLoader = function(immediate) { hideLoader(immediate); };

  // safety timeout: if app doesn't call appReady, hide after 10s to avoid permanent block
  setTimeout(() => { if (document.getElementById('site-loader')) hideLoader(); }, 10000);
})();