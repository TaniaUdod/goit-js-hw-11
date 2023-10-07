import NewApiService from "./api-service";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const searchForm = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let isShown = 0;
loadMoreBtn.disabled = true;
const newApiService = new NewApiService();

searchForm.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', onLoadMore);

function onSearch(event) {
    event.preventDefault();

    gallery.innerHTML = '';
    newApiService.query = event.currentTarget.elements.searchQuery.value.trim();
    newApiService.resetPage();

    if (newApiService.query === '') {
        Notify.warning('Please, fill in the field!');
        return;
    }

    isShown = 0;
    fetchGallery();
    renderImages(hits);
}

function onLoadMore() {
    newApiService.incrementPage();
    fetchGallery();
}

async function fetchGallery() {
    loadMoreBtn.disabled = true;
    const result = await newApiService.fetchGallery();
    const { hits, total } = result;
    isShown += hits.length;

    if (!hits.length) {
        Notify.failure(`Sorry, there are no images matching your search query. Please try again.`);
        loadMoreBtn.disabled = true;
        return;
    }

    renderImages(hits);
    isShown += hits.length;

    if (isShown < total) {
        Notify.success(`Hooray! We found ${total} images.`);
        loadMoreBtn.disabled = false;
    }

    if (isShown >= total) {
        Notify.info("We're sorry, but you've reached the end of search results.");
    }
}

function renderImages(images) {
    const markup = images.map(({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,}) => {
        return `<div class="photo-card">
    <a href="${largeImageURL}">
      <img class="photo-img" src="${webformatURL}" alt="${tags}" loading="lazy" />
    </a>
    <div class="info">
      <p class="info-item"><b>Likes</b>
      ${likes}</p>
      <p class="info-item"><b>Views</b>
      ${views}</p>
      <p class="info-item"><b>Comments</b>
      ${comments}</p>
      <p class="info-item"><b>Downloads</b>
      ${downloads}</p>
    </div>
    </div>`;
      })
    .join('');
    
    gallery.insertAdjacentHTML('beforeend', markup);
    lightbox.refresh();
}

const lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
});