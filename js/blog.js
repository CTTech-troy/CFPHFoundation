import { rtdb } from './firebase.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

async function fetchBlogs() {
  try {
    const blogRef = ref(rtdb, "blog");
    const snapshot = await get(blogRef);

    const recentContainer = document.getElementById("posts-container");
    const articleContainer = document.getElementById("article-1");

    recentContainer.innerHTML = "";
    articleContainer.innerHTML = "";

    if (!snapshot.exists()) {
      recentContainer.innerHTML = "<p class='text-gray-500'>No blogs available.</p>";
      return;
    }

    const blogs = Object.values(snapshot.val())
      .filter(blog => blog.published === true)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const featuredArticle = blogs.find(blog => blog.isArticle) || null;
    const recentBlogs = blogs.filter(blog => !blog.isArticle);

    // Render featured article
    if (featuredArticle) {
      let imageSrc = featuredArticle.imageUrl
        ? (featuredArticle.imageUrl.startsWith("data:image") ? featuredArticle.imageUrl : `data:image/jpeg;base64,${featuredArticle.imageUrl}`)
        : "./assets/img1/7.jpg";

      const shortDesc = featuredArticle.description
        ? featuredArticle.description.slice(0, 32) + "..."
        : "";

      articleContainer.innerHTML = `
        <img src="${imageSrc}" alt="${featuredArticle.title || 'Featured Article'}" class="w-full h-70 object-top object-cover object-center rounded-lg">
        <div class="p-8">
          <div class="flex items-center text-sm text-gray-500 mb-4">
            <span>${featuredArticle.date || ''}</span>
            <span class="mx-2">•</span>
            <span>5 min read</span>
          </div>
          <h3 class="text-2xl font-bold text-secondary mb-4">${featuredArticle.title || 'Untitled'}</h3>
          <p class="text-gray-600 mb-6">${featuredArticle.excerpt || shortDesc}</p>
          
        </div>
      `;

      // Populate modal content dynamically
      const readBtn = articleContainer.querySelector(".read-story-btn");
      if (readBtn) {
        readBtn.addEventListener("click", () => {
          const modal = document.getElementById("blog-modal");
          const modalDialog = modal.querySelector(".modal-dialog");

          modalDialog.innerHTML = `
            <div class="p-8">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-3xl font-bold text-secondary">${featuredArticle.title}</h2>
                <button id="close-blog-modal" class="text-gray-400 hover:text-gray-600">
                  <div class="w-6 h-6 flex items-center justify-center">
                    <i class="ri-close-line ri-lg"></i>
                  </div>
                </button>
              </div>
              <img src="${imageSrc}" alt="${featuredArticle.title}" class="w-full h-96 object-cover object-center rounded-xl mb-6">
              <div class="flex items-center text-sm text-gray-500 mb-6">
                <span>${featuredArticle.date}</span>
                <span class="mx-2">•</span>
                <span>5 min read</span>
                <span class="mx-2">•</span>
                <span>${featuredArticle.author || 'Admin'}</span>
              </div>
              <div class="prose max-w-none">
                <p class="text-gray-600 mb-4">${featuredArticle.description}</p>
              </div>
            </div>
          `;
        });
      }
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
