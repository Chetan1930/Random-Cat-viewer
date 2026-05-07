const BASE_URL = 'https://api.freeapi.app/api/v1/public/cats/cat/random';
const catImage = document.getElementById('cat-image');
const catIdText = document.getElementById('cat-id');
const catBreedText = document.getElementById('cat-breed');
const catDescriptionText = document.getElementById('cat-description');
const viewFavoritesButton = document.getElementById('view-favorites-button');
const favoritesSection = document.getElementById('favorites-section');
const favoritesGrid = document.getElementById('favorites-grid');
const closeFavoritesButton = document.getElementById('close-favorites-button');
const catCounter = document.getElementById('cat-counter');

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/600x400?text=No+Cat+Image';
let prefetchedCat = null;
let prefetchInFlight = null;
let currentCat = null;
let viewedCatsCount = 0;

function getFavorites() {
    const favorites = localStorage.getItem('catFavorites');
    return favorites ? JSON.parse(favorites) : [];
}

function saveFavorites(favorites) {
    localStorage.setItem('catFavorites', JSON.stringify(favorites));
}

function isFavorited(catId) {
    const favorites = getFavorites();
    return favorites.some(cat => cat.id === catId);
}

function showFavorites() {
    const favorites = getFavorites();
    favoritesGrid.innerHTML = '';
    
    if (favorites.length === 0) {
        favoritesGrid.innerHTML = '<p>No favorite cats yet. Click the heart button to add some!</p>';
    } else {
        favorites.forEach(cat => {
            const item = document.createElement('div');
            item.className = 'favorite-item';
            item.innerHTML = `
                <img src="${cat.image}" alt="${cat.name}" loading="lazy">
                <h3>${cat.name || 'Unknown'}</h3>
                <p>${cat.description || 'No description'}</p>
            `;
            favoritesGrid.appendChild(item);
        });
    }
    
    favoritesSection.classList.remove('hidden');
    favoritesSection.scrollIntoView({ behavior: 'smooth' });
}

function hideFavorites() {
    favoritesSection.classList.add('hidden');
}

function getImageUrl(data) {
    if (!data) return PLACEHOLDER_IMAGE;
    if (typeof data.image === 'string') return data.image;
    if (typeof data.image?.url === 'string') return data.image.url;
    if (typeof data.url === 'string') return data.url;
    return PLACEHOLDER_IMAGE;
}

function preloadImage(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(src);
        image.onerror = () => reject(new Error('Unable to load image'));
        image.src = src;
    });
}

function renderCat(data, imageUrl) {
    currentCat = data;
    viewedCatsCount++;
    catCounter.textContent = `Cats viewed: ${viewedCatsCount}`;
    
    catImage.src = imageUrl;
    catImage.alt = `Random cat ${data.id || data.name || ''}`;
    catIdText.innerText = data.id ? `Cat ID: ${data.id}` : 'Cat ID: —';
    catBreedText.innerText = data.name ? `Breed: ${data.name}` : 'Breed information unavailable.';
    catDescriptionText.innerText = data.description || data.temperament || 'No description available.';
    
    // Update favorite button
    if (data.id && isFavorited(data.id)) {
        favoriteButton.classList.add('favorited');
        favoriteButton.textContent = '💖 Favorited';
    } else {
        favoriteButton.classList.remove('favorited');
        favoriteButton.textContent = '❤️ Favorite';
    }
}

async function fetchCatData() {
    const response = await fetch(BASE_URL, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    const responseData = await response.json();
    return responseData.data || responseData;
}

function prefetchNextCat() {
    if (prefetchInFlight) return;
    prefetchInFlight = fetchCatData()
        .then((cat) => {
            prefetchedCat = cat;
        })
        .catch(() => {
            prefetchedCat = null;
        })
        .finally(() => {
            prefetchInFlight = null;
        });
}

async function fetchCat() {
    showLoading(true);
    try {
        const cat = prefetchedCat || (await fetchCatData());
        prefetchedCat = null;
        const imageUrl = getImageUrl(cat);
        const finalImageUrl = await preloadImage(imageUrl).catch(() => PLACEHOLDER_IMAGE);
        renderCat(cat, finalImageUrl);
        prefetchNextCat();
    } catch (error) {
        console.error('Error fetching cat data:', error);
        catIdText.innerText = 'Unable to load a cat right now.';
        catBreedText.innerText = '';
        catDescriptionText.innerText = 'Please try again in a moment.';
        catImage.src = PLACEHOLDER_IMAGE;
        catImage.alt = 'Failed to load cat image';
        catImage.hidden = false;
    } finally {
        showLoading(false);
    }
}

newCatButton.addEventListener('click', fetchCat);
favoriteButton.addEventListener('click', toggleFavorite);
viewFavoritesButton.addEventListener('click', showFavorites);
closeFavoritesButton.addEventListener('click', hideFavorites);

// Keyboard support
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' || event.code === 'Enter') {
        if (document.activeElement === document.body) {
            event.preventDefault();
            fetchCat();
        }
    }
});

fetchCat();