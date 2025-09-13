import { rtdb } from "./firebase.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// helper: random-weighted choice for masonry spans / color classes
function weightedRand(spec) {
  let i, sum = 0, r = Math.random();
  for (i in spec) {
    sum += spec[i];
    if (r <= sum) return Number(i);
  }
  return 1;
}

// local fallback images (id = basename)
const localImages = Array.from({ length: 20 }, (_, i) => ({
  id: `${i + 1}.jpg`,
  imageUrl: `../assets/img1/${i + 1}.jpg`
}));

// global image error logging + fallback swap
window.addEventListener('error', (e) => {
  const t = e.target || e.srcElement;
  if (t && t.tagName === 'IMG') {
    console.warn('Image load error (likely 404):', t.src);
  }
}, true);

function attachImgHandlers(img) {
  if (!img) return;
  img.addEventListener('error', () => {
    console.warn('Replacing broken image with fallback:', img.src);
    img.src = '../assets/logo.png'; // change fallback if needed
    img.alt = 'fallback image';
    img.classList.add('img-broken');
  });
}

function normalizeImageUrl(raw) {
  if (!raw) return raw;
  const s = String(raw).trim();
  if (/^https?:\/\//i.test(s)) return s;                 // full URL
  if (/^\.\.?\//.test(s)) return s;                      // already relative like ../assets/...
  const basename = s.split('/').pop();
  // match known local asset by basename
  if (localImages.some(li => li.id === basename)) return `../assets/img1/${basename}`;
  // if stored as assets/..., prefix with ../ so path is correct from page
  if (/^assets\//i.test(s)) return `../${s}`;
  // if contains folder but not assets, assume ../assets/<that path>
  if (s.includes('/')) return `../assets/${s}`;
  // fallback to ../assets/img1/<basename>
  return `../assets/img1/${basename}`;
}

// render gallery cards (clears container)
function renderGallery(items) {
  const galleryGrid = document.getElementById('gallery-grid');
  if (!galleryGrid) return;
  galleryGrid.innerHTML = '';
  items.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'gallery-card rounded-lg overflow-hidden shadow-lg bg-white card-hover';
    card.dataset.category = item.category || 'all';
    card.dataset.id = item.id || item.imageUrl;

    const img = document.createElement('img');
    img.src = item.imageUrl;
    img.alt = item.title || item.id || `Gallery image ${i + 1}`;
    img.className = 'w-full h-64 object-cover';
    attachImgHandlers(img);

    const overlay = document.createElement('div');
    overlay.className = 'overlay text-white text-lg font-semibold';
    overlay.textContent = 'View Image';

    card.appendChild(img);
    card.appendChild(overlay);
    galleryGrid.appendChild(card);

    console.log('renderGallery item:', { id: item.id, url: item.imageUrl });
  });
}

// append to gallery without clearing
function appendGallery(items) {
  const galleryGrid = document.getElementById('gallery-grid');
  if (!galleryGrid) return;
  items.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'gallery-card rounded-lg overflow-hidden shadow-lg bg-white card-hover';
    card.dataset.category = item.category || 'all';
    card.dataset.id = item.id || item.imageUrl;

    const img = document.createElement('img');
    img.src = item.imageUrl;
    img.alt = item.title || item.id || `Gallery image ${galleryGrid.children.length + 1}`;
    img.className = 'w-full h-64 object-cover';
    attachImgHandlers(img);

    const overlay = document.createElement('div');
    overlay.className = 'overlay text-white text-lg font-semibold';
    overlay.textContent = 'View Image';

    card.appendChild(img);
    card.appendChild(overlay);
    galleryGrid.appendChild(card);

    console.log('appendGallery item:', { id: item.id, url: item.imageUrl });
  });
}

// render masonry grid (clears)
function renderMasonry(items) {
  const grid = document.getElementById('grid');
  if (!grid) return;
  grid.innerHTML = '';
  items.forEach((item, i) => {
    const span = weightedRand({ 1: 0.7, 2: 0.2, 3: 0.1 });
    const colorClass = 'm-color-' + (i % 5 + 1);
    const div = document.createElement('div');
    div.className = `masonry-item masonry-span-${span} ${colorClass}`;
    div.style.backgroundImage = `url('${item.imageUrl}')`;
    div.dataset.id = item.id || item.imageUrl;
    grid.appendChild(div);
  });
}

// append masonry items
function appendMasonry(items) {
  const grid = document.getElementById('grid');
  if (!grid) return;
  items.forEach((item, i) => {
    const span = weightedRand({ 1: 0.7, 2: 0.2, 3: 0.1 });
    const colorClass = 'm-color-' + ((grid.children.length + i) % 5 + 1);
    const div = document.createElement('div');
    div.className = `masonry-item masonry-span-${span} ${colorClass}`;
    div.style.backgroundImage = `url('${item.imageUrl}')`;
    div.dataset.id = item.id || item.imageUrl;
    grid.appendChild(div);
  });
}

export async function displayPublishedImages() {
  try {
    const dbRef = ref(rtdb, 'publishedImages');
    const snapshot = await get(dbRef);
    console.log('Firebase snapshot:', snapshot);
    let images = [];

    // normalize local images once for comparisons & fallback rendering
    const normalizedLocal = localImages.map(li => ({ id: li.id, imageUrl: normalizeImageUrl(li.imageUrl) }));

    if (snapshot.exists()) {
      const mediaData = snapshot.val();
      console.log('publishedImages node (raw):', mediaData);

      const publishedMedia = Object.entries(mediaData)
        .filter(([id, p]) => p && (p.published === true || p.published === 'true') && p.imageUrl)
        .map(([id, p]) => {
          const normalized = normalizeImageUrl(p.imageUrl);
          console.log('mapped DB item:', { id, raw: p.imageUrl, normalized, title: p.title || '', category: p.category || 'all' });
          return { id, imageUrl: normalized, title: p.title || '', category: p.category || 'all' };
        });

      images = publishedMedia;
      console.log('Final DB images to render:', images);

      // remove duplicates from localImages using normalized local urls
      const existingIds = new Set(images.map(x => x.id));
      const existingUrls = new Set(images.map(x => x.imageUrl));
      const fallbackLocal = normalizedLocal
        .filter(li => !existingIds.has(li.id) && !existingUrls.has(li.imageUrl))
        .map(li => ({ id: li.id, imageUrl: li.imageUrl }));

      console.log('Local images available to append (non-duplicate):', fallbackLocal);

      // render DB items first
      renderGallery(images);
      renderMasonry(images);

      // then append only non-duplicate local items
      if (fallbackLocal.length) {
        appendGallery(fallbackLocal);
        appendMasonry(fallbackLocal);
      }
      return;
    }

    // fallback: no DB node -> use normalized local images
    console.info('No publishedImages node found; using local assets fallback.');
    console.log('Local images used for render:', normalizedLocal);
    const localForRender = normalizedLocal.map(li => ({ id: li.id, imageUrl: li.imageUrl }));
    renderGallery(localForRender);
    renderMasonry(localForRender);
  } catch (error) {
    console.error('Error loading images:', error);
    // on error fallback to normalized local
    const normalizedLocal = localImages.map(li => ({ id: li.id, imageUrl: normalizeImageUrl(li.imageUrl) }));
    console.log('Falling back to local images due to error:', normalizedLocal);
    renderGallery(normalizedLocal);
    renderMasonry(normalizedLocal);
  }
}

// Lightbox Logic (delegated)
document.addEventListener('click', (e) => {
  const card = e.target.closest('.gallery-card');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');

  if (card) {
    const img = card.querySelector('img');
    if (img && lightboxImg) {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || 'Expanded view';
      lightbox.classList.remove('hidden');
    }
  }

  if (e.target.id === 'close-lightbox' || e.target.id === 'lightbox') {
    const lightboxEl = document.getElementById('lightbox');
    if (lightboxEl) lightboxEl.classList.add('hidden');
  }
});

// initial run
displayPublishedImages();
