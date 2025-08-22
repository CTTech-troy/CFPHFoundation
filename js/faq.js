import { rtdb } from './firebase.js';
import { ref, onValue } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js';

document.addEventListener('DOMContentLoaded', () => {
  const faqContainer = document.getElementById('faq-container');
  if (!faqContainer) return;

  const faqsRef = ref(rtdb, 'faqs');

  onValue(faqsRef, (snapshot) => {
    faqContainer.innerHTML = ''; // Clear container before rendering

    if (snapshot.exists()) {
      const faqs = snapshot.val();
      Object.entries(faqs).forEach(([id, faq]) => {
        const faqItem = document.createElement('div');
        faqItem.className = 'faq-item border border-gray-200 rounded-xl';

        faqItem.innerHTML = `
          <button class="faq-question w-full text-left p-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
            <span class="font-semibold text-secondary">${faq.question}</span>
            <div class="w-6 h-6 flex items-center justify-center">
              <i class="ri-add-line ri-lg text-gray-400"></i>
            </div>
          </button>
          <div class="faq-answer hidden px-6 pb-6">
            <p class="text-gray-600">${faq.answer}</p>
          </div>
        `;

        faqContainer.appendChild(faqItem);
      });

      // Toggle answers on click
      faqContainer.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
          const answer = button.nextElementSibling;
          answer.classList.toggle('hidden');
          const icon = button.querySelector('i');
          icon.classList.toggle('ri-add-line');
          icon.classList.toggle('ri-subtract-line');
        });
      });
    } else {
      faqContainer.innerHTML = '<p class="text-gray-500">No FAQs found.</p>';
    }
  }, (error) => {
    console.error('Error fetching FAQs:', error);
  });
});
