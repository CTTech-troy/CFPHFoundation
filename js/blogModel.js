// modal.js
document.addEventListener('DOMContentLoaded', function () {
  const blogModal = document.getElementById('blog-modal');
  if (!blogModal) return;

  const dialog = blogModal.querySelector('.modal-dialog');
  if (!dialog) return;

  function openModal() {
    blogModal.classList.remove('hidden');
    blogModal.style.display = 'flex';
    blogModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      dialog.style.transform = 'scale(1)';
      dialog.style.opacity = '1';
      blogModal.style.opacity = '1';
    });
  }

  function closeModal() {
    dialog.style.transform = 'scale(0.96)';
    dialog.style.opacity = '0';
    blogModal.style.opacity = '0';

    setTimeout(() => {
      blogModal.classList.add('hidden');
      blogModal.style.display = '';
      blogModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      dialog.style.transform = 'scale(0.96)';
      dialog.style.opacity = '0';
      blogModal.style.opacity = '';
    }, 260);
  }

  // Event delegation for opening and closing modal
  document.addEventListener('click', function (e) {
    if (e.target.closest('.read-story-btn')) {
      openModal();
    }

    if (e.target.closest('#close-blog-modal')) {
      closeModal();
    }
  });

  // Overlay click closes modal
  blogModal.addEventListener('click', function (e) {
    if (e.target === blogModal) closeModal();
  });

  // Escape key closes modal
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !blogModal.classList.contains('hidden')) closeModal();
  });
});
