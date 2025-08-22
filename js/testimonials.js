import { rtdb } from './firebase.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Function to generate a color from a string (author's name)
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 60%, 50%)`; // HSL for vibrant colors
  return color;
}

async function fetchAndRenderTestimonials() {
  try {
    const testimonialsRef = ref(rtdb, "testimonials");
    const snapshot = await get(testimonialsRef);

    if (!snapshot.exists()) return;

    const testimonials = Object.values(snapshot.val()).filter(item => item.published === true);

    if (testimonials.length === 0) return; // No published testimonials

    // Select all testimonial cards
    const containers = document.querySelectorAll('.grid.content-center > .p-6.rounded.shadow-md');

    // Clear existing content
    containers.forEach(container => {
      container.querySelector('p') && (container.querySelector('p').textContent = '');
      container.querySelector('p.text-lg') && (container.querySelector('p.text-lg').textContent = '');
      container.querySelector('p.text-sm') && (container.querySelector('p.text-sm').textContent = '');
      container.querySelector('img') && (container.querySelector('img').src = '');
    });

    // Render published testimonials
    testimonials.forEach((testimonial, index) => {
      if (!containers[index]) return; // Stop if no more cards

      const container = containers[index];
      const p = container.querySelector('p');
      const img = container.querySelector('img');
      const name = container.querySelector('p.text-lg');
      const role = container.querySelector('p.text-sm');

      if (p) p.textContent = testimonial.description;
      if (name) name.textContent = testimonial.author;
      if (role) role.textContent = testimonial.category;

      // Generate first-letter SVG avatar with unique color
      if (img) {
        const firstLetter = testimonial.author ? testimonial.author.charAt(0).toUpperCase() : "A";
        const bgColor = stringToColor(testimonial.author || "Anonymous");

        const svg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50">
            <rect width="50" height="50" fill="${bgColor}" />
            <text x="50%" y="50%" font-size="24" fill="#fff" text-anchor="middle" alignment-baseline="central" font-family="Arial, sans-serif">${firstLetter}</text>
          </svg>
        `;
        img.src = `data:image/svg+xml;base64,${btoa(svg)}`;
      }
    });

    console.log("Testimonials rendered successfully.");
  } catch (error) {
    console.error("Error fetching testimonials:", error);
  }
}

document.addEventListener("DOMContentLoaded", fetchAndRenderTestimonials);
