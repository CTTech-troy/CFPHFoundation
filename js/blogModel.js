{/* <script id="blog-modal"> */}
document.addEventListener('DOMContentLoaded', function () {
  const readStoryBtns = document.querySelectorAll('.read-story-btn');
  const blogModal = document.getElementById('blog-modal');
  if (!blogModal) return;

  const dialog = blogModal.querySelector('.modal-dialog');
  const closeBlogModal = document.getElementById('close-blog-modal');

  // if essential DOM nodes are missing, bail out
  if (!dialog || !closeBlogModal) return;

  // initial styles for animation
  dialog.style.transition = 'transform 0.25s ease, opacity 0.25s ease';
  dialog.style.transform = 'scale(0.96)';
  dialog.style.opacity = '0';
  // ensure overlay centers modal when it's shown
  blogModal.style.display = blogModal.classList.contains('hidden') ? '' : blogModal.style.display;
  blogModal.style.justifyContent = blogModal.style.justifyContent || 'center';
  blogModal.style.alignItems = blogModal.style.alignItems || 'center';

  function openModal(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    blogModal.classList.remove('hidden');
    blogModal.style.display = 'flex';
    blogModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // animate in
    requestAnimationFrame(() => {
      blogModal.style.opacity = '1';
      dialog.style.transform = 'scale(1)';
      dialog.style.opacity = '1';
    });
  }

  function closeModal() {
    // animate out
    dialog.style.transform = 'scale(0.96)';
    dialog.style.opacity = '0';
    blogModal.style.opacity = '0';

    setTimeout(() => {
      blogModal.classList.add('hidden');
      blogModal.style.display = '';
      blogModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      // reset dialog to initial state so next open animates correctly
      dialog.style.transform = 'scale(0.96)';
      dialog.style.opacity = '0';
      blogModal.style.opacity = '';
    }, 260);
  }

  // attach open handler to all matching buttons (supports multiple articles)
  if (readStoryBtns && readStoryBtns.length) {
    readStoryBtns.forEach(btn => btn.addEventListener('click', openModal));
  }

  closeBlogModal.addEventListener('click', closeModal);

  // close when clicking the overlay (but not when clicking inside dialog)
  blogModal.addEventListener('click', function (e) {
    if (e.target === blogModal) closeModal();
  });

  // close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !blogModal.classList.contains('hidden')) closeModal();
  });
});
// </script>