import { rtdb } from './firebase.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

async function displayPublishedImages() {
  const galleryGrid = document.getElementById("gallery-grid");
  if (!galleryGrid) {
    console.error("Gallery grid element not found!");
    return;
  }

  galleryGrid.innerHTML = '<p class="col-span-full text-center text-gray-500">Loading images...</p>';

  try {
    const mediaRef = ref(rtdb, "media");
    const snapshot = await get(mediaRef);

    if (!snapshot.exists()) {
      galleryGrid.innerHTML = '<p class="col-span-full text-center text-gray-500">No data available in the database.</p>';
      return;
    }

    const mediaData = snapshot.val();
    const publishedMedia = Object.values(mediaData).filter(p => p.published && p.imageUrl);

    if (publishedMedia.length === 0) {
      galleryGrid.innerHTML = '<p class="col-span-full text-center text-gray-500">No published images available.</p>';
      return;
    }

    galleryGrid.innerHTML = ""; // clear grid

    publishedMedia.forEach(item => {
      const card = document.createElement("div");
      card.className = "gallery-card bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300";
      card.dataset.category = item.category || "all";

      card.innerHTML = `
        <img src="${item.imageUrl}" 
             alt="${item.title || "Published Image"}" 
             class="w-full h-64 object-cover object-top block">
        <div class="overlay p-4 bg-black bg-opacity-30">
          <h3 class="text-lg font-semibold text-white">${item.title || "-"}</h3> 
        </div>
      `;
      galleryGrid.appendChild(card);
    });

    // Lightbox logic
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const closeLightbox = document.getElementById("close-lightbox");

    const galleryCards = document.querySelectorAll(".gallery-card");
    galleryCards.forEach(card => {
      card.addEventListener("click", () => {
        const img = card.querySelector("img");
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add("active");
        document.body.style.overflow = "hidden";
      });
    });

    closeLightbox.addEventListener("click", () => {
      lightbox.classList.remove("active");
      document.body.style.overflow = "auto";
    });

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove("active");
        document.body.style.overflow = "auto";
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox.classList.contains("active")) {
        lightbox.classList.remove("active");
        document.body.style.overflow = "auto";
      }
    });

  } catch (error) {
    console.error("Error fetching media:", error);
    galleryGrid.innerHTML = '<p class="col-span-full text-center text-red-500">Error loading images.</p>';
  }
}

document.addEventListener("DOMContentLoaded", displayPublishedImages);
