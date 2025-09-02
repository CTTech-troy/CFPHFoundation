import { rtdb } from './firebase.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

let featuredInterval = null; // rotate featured articles if more than one
let featuredFadeTimer = null;
const FADE_DURATION = 600; // ms

function ensureFadeStyles() {
  if (document.getElementById('featured-fade-styles')) return;
  const style = document.createElement('style');
  style.id = 'featured-fade-styles';
  style.textContent = `
    #article-1 { transition: opacity ${FADE_DURATION}ms ease-in-out, transform ${FADE_DURATION}ms ease-in-out; opacity: 1; transform: translateY(0); }
    #article-1.fade-out { opacity: 0; transform: translateY(8px); }
    #article-1.fade-in { opacity: 1; transform: translateY(0); }
  `;
  document.head.appendChild(style);
}

async function fetchBlogs() {
  try {
    const blogRef = ref(rtdb, "blog");
    const snapshot = await get(blogRef);

    const recentContainer = document.getElementById("posts-container");
    const articleContainer = document.getElementById("article-1");
    ensureFadeStyles();
    // ensure the element has base fade class
    if (articleContainer && !articleContainer.classList.contains('fade-in') && !articleContainer.classList.contains('fade-out')) {
      articleContainer.classList.add('fade-in');
    }

    const allValues = snapshot.exists() ? Object.values(snapshot.val()) : [];
    const markedArticles = allValues.filter(item => item && item.isArticle === true);
    console.log("Entries with isArticle === true:", markedArticles);

    recentContainer.innerHTML = "";
    articleContainer.innerHTML = "";

    if (!snapshot.exists()) {
      recentContainer.innerHTML = "<p class='text-gray-500'>No blogs available.</p>";
      return;
    }

    const blogs = Object.values(snapshot.val())
      .filter(blog => blog.published === true)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    // gather all featured articles (isArticle === true)
    const featuredArticles = blogs.filter(blog => blog.isArticle === true);
    const recentBlogs = blogs.filter(blog => !blog.isArticle);

    // helper to render a single featured article (and attach modal listener)
    function renderFeatured(article, immediate = false) {
      const imageSrc = article.imageUrl
        ? (article.imageUrl.startsWith("data:image") ? article.imageUrl : `data:image/jpeg;base64,${article.imageUrl}`)
        : "./assets/img1/7.jpg";

      const shortDesc = article.description
        ? article.description.slice(0, 32) + "..."
        : "";

      const content = `
        <img src="${imageSrc}" alt="${article.title || 'Featured Article'}" class="w-full h-70 object-top object-cover object-center rounded-lg">
        <div class="p-8">
          <div class="flex items-center text-sm text-gray-500 mb-4">
            <span>${article.date || ''}</span>
            <span class="mx-2">•</span>
            <span>${article.author || ''}</span>
          </div>
          <h3 class="text-2xl font-bold text-secondary mb-4">${article.title || 'Untitled'}</h3>
          <p class="text-gray-600 mb-6">${article.excerpt || shortDesc}</p>
        </div>
      `;

      // If immediate (first render) skip fade-out and just set content then fade-in
      if (immediate || !articleContainer.classList.contains('fade-in')) {
        if (featuredFadeTimer) { clearTimeout(featuredFadeTimer); featuredFadeTimer = null; }
        articleContainer.innerHTML = content;
        articleContainer.classList.remove('fade-out');
        // force reflow then add fade-in
        void articleContainer.offsetWidth;
        articleContainer.classList.add('fade-in');
      } else {
        // fade out, wait, swap content, fade in
        articleContainer.classList.remove('fade-in');
        articleContainer.classList.add('fade-out');

        if (featuredFadeTimer) clearTimeout(featuredFadeTimer);
        featuredFadeTimer = setTimeout(() => {
          articleContainer.innerHTML = content;
          articleContainer.classList.remove('fade-out');
          // reflow to ensure transition
          void articleContainer.offsetWidth;
          articleContainer.classList.add('fade-in');
          featuredFadeTimer = null;
        }, FADE_DURATION);
      }

      // attach modal population for this article (re-query after swapping content)
      // Use a microtask to ensure DOM updated when content changes
      setTimeout(() => {
        const readBtn = articleContainer.querySelector(".read-story-btn");
        if (readBtn) {
          // remove previous listeners by replacing the node (safer) or using { once: true } if desired
          readBtn.addEventListener("click", () => {
            const modal = document.getElementById("blog-modal");
            if (!modal) return;
            const modalDialog = modal.querySelector(".modal-dialog");

            modalDialog.innerHTML = `
              <div class="p-8">
                <div class="flex justify-between items-center mb-6">
                  <h2 class="text-3xl font-bold text-secondary">${article.title}</h2>
                  <button id="close-blog-modal" class="text-gray-400 hover:text-gray-600">
                    <div class="w-6 h-6 flex items-center justify-center">
                      <i class="ri-close-line ri-lg"></i>
                    </div>
                  </button>
                </div>
                <img src="${imageSrc}" alt="${article.title}" class="w-full h-96 object-cover object-center rounded-xl mb-6">
                <div class="flex items-center text-sm text-gray-500 mb-6">
                  <span>${article.date}</span>
                  <span class="mx-2">•</span>
                  <span>5 min read</span>
                  <span class="mx-2">•</span>
                  <span>${article.author || 'Admin'}</span>
                </div>
                <div class="prose max-w-none">
                  <p class="text-gray-600 mb-4">${article.description}</p>
                </div>
              </div>
            `;
          });
        }
      }, 0);
    }

    // clear any previous rotation interval
    if (featuredInterval) {
      clearInterval(featuredInterval);
      featuredInterval = null;
    }

    // render featured(s): if multiple, rotate every 5s in a loop
    if (featuredArticles.length === 0) {
      // no featured article — keep articleContainer empty or show placeholder
      articleContainer.innerHTML = "";
    } else if (featuredArticles.length === 1) {
      renderFeatured(featuredArticles[0], true);
    } else {
      let idx = 0;
      renderFeatured(featuredArticles[idx], true); // first show immediate with fade-in
      featuredInterval = setInterval(() => {
        idx = (idx + 1) % featuredArticles.length;
        renderFeatured(featuredArticles[idx]);
      }, 5000);
    }

    // Render recent posts
    if (recentBlogs.length === 0) {
      recentContainer.innerHTML = "<p class='text-gray-500'>No recent blogs available.</p>";
    } else {
      recentBlogs.forEach(blog => {
        let imageSrc = blog.imageUrl
          ? (blog.imageUrl.startsWith("data:image") ? blog.imageUrl : `data:image/jpeg;base64,${blog.imageUrl}`)
          : "https://via.placeholder.com/80x60?text=No+Image";

        const article = document.createElement("article");
        article.className = "flex gap-4";
        article.innerHTML = `
          <img src="${imageSrc}" alt="${blog.title || 'Blog'}" class="w-20 h-15 rounded object-cover object-top flex-shrink-0">
          <div>
            <h4 class="font-semibold text-sm text-secondary mb-1">${blog.title || 'Untitled'}</h4>
            <p class="text-xs text-gray-500">${blog.date || ''}</p>
          </div>
        `;
        recentContainer.appendChild(article);
      });
    }

  } catch (error) {
    console.error("Error fetching blogs:", error);
    const recentContainer = document.getElementById("posts-container");
    recentContainer.innerHTML = "<p class='text-red-500'>Failed to load blogs.</p>";
  }
}

fetchBlogs();
