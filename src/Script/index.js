import '../styles/index.scss';
import { getData } from './request';


const apiKey = process.env.APIKEY;
const headlinesURL = `https://newsapi.org/v2/top-headlines?country=in&apiKey=${apiKey}`;
const everythingURL = `https://newsapi.org/v2/everything?apiKey=${apiKey}`;

// elements
const loader = document.querySelector('#loading');
const newsContainer = document.querySelector('#news-articles');
const more = document.querySelector('#show-more');
const searchBox = document.querySelector('#search');
const notFound = document.querySelector('.not-found');
const error = document.querySelector('.error');
const clearSearch = document.querySelector('#clear-search');
const switcher = document.getElementById('mode-switch');

// data
let articles = [];
let totalResults = 0;
let state = 'h';
const headlinesFilter = {
  page: 1,
  pageSize: 20,
  q: ''
};
let theme;

init();

/**
 * Gets the articles
 * @async
 * @returns Promise<void>
 * @param {boolean} isSearch boolean to check if should be using the search url
 * @param {number} page the page number
 * @param {number} pageSize the page size
 * @param {string} q the query to be searched
 */
async function getArticles(
  isSearch,
  page = headlinesFilter.page,
  pageSize = headlinesFilter.pageSize,
  q = headlinesFilter.q
) {
  try {
    const url = isSearch
      ? `${everythingURL}&q=${q}&page=${page}&pageSize=${pageSize}`
      : `${headlinesURL}&page=${page}&pageSize=${pageSize}`;
    state = isSearch ? 'e' : 'h';
    const data = await getData(url);

    if (data.status !== 'ok') {
      handleError(error);
      return;
    }

    if (data.articles.length === 0) {
      notFound.style.display = 'block';
      newsContainer.style.display = 'none';
      articles = [];
      return;
    }

    // show data on screen
    totalResults = data.totalResults;
    articles = [...articles, ...data.articles];

    const list = renderNews(articles);

    newsContainer.innerHTML = list;
    newsContainer.style.display = 'grid';
    notFound.style.display = 'none';
  } catch (error) {
    // console.log(error);
    handleError(error);
  } finally {
    loader.style.display = 'none';
    if (totalResults !== articles.length && articles.length > 0) {
      more.style.display = 'block';
    } else {
      more.style.display = 'none';
    }
  }
}

/**
 * Initialise the app
 * @returns void
 */
function init() {
  themeInit();
  loader.style.display = 'flex';
  error.style.display = 'none';
  clearSearch.style.display = 'none';
  articles = [];
  getArticles(false);
}

/**
 * Clears the filters
 * and resets the app
 */
function clear() {
  searchBox.value = null;
  clearSearch.style.display = 'none';
  init();
}

function handleError(msg = null) {
  error.style.display = 'block';
}

/**
 * Creates HTML list of articles
 * @param {array} news array of news articles
 * @return string
 */
function renderNews(news) {
  let html = '';
  news.forEach(n => {
    const author = n.author ? n.author : n.source.name;
    const image = n.urlToImage
      ? n.urlToImage
      : 'https://www.okea.org/wp-content/uploads/2019/10/placeholder.png';
    html += `<li class="article">
      <a href="${n.url}" class="article-link">
        <div class="article__head">
          <img
            src="${image}"
            alt="${n.title}"
            class="article-img"
          />
          <h2 class="article-title">
            ${n.title}
          </h2>
        </div>
        <p class="article-description">
          ${n.description ? n.description : ''}
        </p>
        // <div class="article__footer">
          <span class="article-author">${author}</span>
        //</div>
      </a>
    </li>`;
  });
  return html;
}

searchBox.addEventListener('keyup', e => {
  clearSearch.style.display = 'block';
  if (e.keyCode === 13) {
    loader.style.display = 'flex';
    newsContainer.style.display = 'none';
    headlinesFilter.q = e.target.value.trim();
    articles = [];
    getArticles(true);
  }
});

clearSearch.addEventListener('click', clear);

more.addEventListener('click', infiniteScroll);

/**
 * For infinite scroll
 */
function infiniteScroll() {
  loader.style.display = 'flex';
  headlinesFilter.page++;
  const isSearch = state === 'e' ? true : false;
  getArticles(isSearch);
}

switcher.addEventListener('change', e => {
  const checked = e.target.checked;
  const theme = checked ? 'dark' : 'light';
  changeTheme(theme);
});

/**
 * Changes the theme for the App
 * @param {string} theme expects a string as "dark" or light
 * @returns void
 * @example changeTheme("dark")
 */
function changeTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
  } else if (theme === 'light') {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
  }
}

/**
 * Loading a theme from localstorage if there is
 * one or else setting "light" theme
 * @returns void
 */
function themeInit() {
  if (localStorage.getItem('theme')) {
    theme = localStorage.getItem('theme');
  } else {
    theme = 'light';
    localStorage.setItem('theme', 'light');
  }
  changeTheme(theme);
  switcher.checked = theme === 'dark' ? true : false;
}