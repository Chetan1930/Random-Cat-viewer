const BASE_URL = 'https://api.freeapi.app/api/v1/public/cats/cat/random';
const catImage = document.getElementById('cat-image');
const catIdText = document.getElementById('cat-id');
const catBreedText = document.getElementById('cat-breed');
const catDescriptionText = document.getElementById('cat-description');
const newCatButton = document.getElementById('new-cat-button');
const loadingText = document.getElementById('loading');

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/600x400?text=No+Cat+Image';
let prefetchedCat = null;
let prefetchInFlight = null;

function showLoading(isLoading) {
    loadingText.hidden = !isLoading;
    catImage.hidden = isLoading;
    newCatButton.disabled = isLoading;
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
    catImage.src = imageUrl;
    catImage.alt = `Random cat ${data.id || data.name || ''}`;
    catIdText.innerText = data.id ? `Cat ID: ${data.id}` : 'Cat ID: —';
    catBreedText.innerText = data.name ? `Breed: ${data.name}` : 'Breed information unavailable.';
    catDescriptionText.innerText = data.description || data.temperament || 'No description available.';
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
fetchCat();