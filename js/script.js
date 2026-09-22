const redirectURL = "LINK OFFER";

const pageTitle = document.getElementById("pageTitle");
const playerBox = document.getElementById("playerBox");
const video = document.getElementById("mainVideo");

const playButton = document.getElementById("playButton");
const loader = document.getElementById("loader");


const ytWrap = document.getElementById("ytWrap");
const watchNowBtn = document.getElementById("watchNowBtn");

const signupPopup = document.getElementById("signupPopup");
const popupClose = document.getElementById("popupClose");
const signupBtn = document.getElementById("signupBtn");



const movieNameInPopup = document.getElementById("movieNameInPopup");
const signupForm = document.getElementById("signupForm");
/* Bottom bar controls */
const playToggle = document.getElementById("playToggle");
const playIcon = document.getElementById("playIcon");

const muteBtn = document.getElementById("muteBtn");
const volWaves = document.getElementById("volWaves");

const pipBtn = document.getElementById("pipBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");

/* -------------------------
   TITLE from URL:
   - ?movie=Fast+Action+2025
   - ?title=Fast+Action+2025
-------------------------- */
function setPageTitle(text) {
  if (!text) return;
  pageTitle.textContent = text;
  document.title = text;
  if (movieNameInPopup) movieNameInPopup.textContent = text;
}

function getMovieTitleFromURL() {
  const params = new URLSearchParams(window.location.search);
  let title = params.get("movie") || params.get("title");
  if (!title) return null;

  // Convert + to spaces
  title = title.replace(/\+/g, " ");
  try { title = decodeURIComponent(title); } catch (_) {}

  return title.trim();
}


/* -------------------------
   OMDb Auto Details (Title -> Poster/Plot/Meta)
-------------------------- */
const OMDB_API_KEY = "61dd9b8d";
const movieTagEl = document.getElementById("movieTag");
const movieTitle2El = document.getElementById("movieTitle2");
const movieSynopsisEl = document.getElementById("movieSynopsis");

const metaYearEl = document.getElementById("metaYear");
const metaRuntimeEl = document.getElementById("metaRuntime");
const metaImdbEl = document.getElementById("metaImdb");
const metaGenreEl = document.getElementById("metaGenre");
const metaDirectorEl = document.getElementById("metaDirector");

function minutesToHM(runtimeText) {
  const m = /([0-9]+)\s*min/i.exec(runtimeText || "");
  if (!m) return runtimeText || "â€”";
  const mins = parseInt(m[1], 10);
  const h = Math.floor(mins / 60);
  const r = mins % 60;
  return h > 0 ? `${h}h ${r}m` : `${r}m`;
}

async function fetchMovieDetailsByTitle(title) {
  if (!title) return;
  try {
    const url = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data || data.Response === "False") {
      console.log("OMDb: not found:", data?.Error);
      return;
    }

    // Title everywhere
    const finalTitle = (data.Title && data.Title !== "N/A") ? data.Title : title;
    setPageTitle(finalTitle);
    if (movieTitle2El) movieTitle2El.textContent = `Watch ${finalTitle}`;

    // Tag: Genre â€¢ Rated â€¢ Year
    const genre = (data.Genre || "").split(",")[0]?.trim();
    const year = data.Year || "";
    const rated = data.Rated && data.Rated !== "N/A" ? data.Rated : "";
    const tagParts = [genre, rated, year].filter(Boolean);
    if (movieTagEl && tagParts.length) movieTagEl.textContent = tagParts.join(" â€¢ ");

    // Plot
    if (movieSynopsisEl && data.Plot && data.Plot !== "N/A") {
      movieSynopsisEl.textContent = data.Plot;
    }

    // Meta
    if (metaYearEl && data.Year && data.Year !== "N/A") metaYearEl.textContent = data.Year;
    if (metaRuntimeEl && data.Runtime && data.Runtime !== "N/A") metaRuntimeEl.textContent = minutesToHM(data.Runtime);
    if (metaImdbEl && data.imdbRating && data.imdbRating !== "N/A") metaImdbEl.textContent = data.imdbRating;
    if (metaGenreEl && data.Genre && data.Genre !== "N/A") metaGenreEl.textContent = data.Genre.split(",")[0].trim();
    if (metaDirectorEl && data.Director && data.Director !== "N/A") metaDirectorEl.textContent = data.Director.split(",")[0].trim();

    // Poster -> video poster
    if (data.Poster && data.Poster !== "N/A") {
      try { video.setAttribute("poster", data.Poster); } catch (_) {}
    }
  } catch (e) {
    console.log("OMDb fetch error:", e);
  }
}

/* INIT */
const urlMovieTitle = getMovieTitleFromURL();
if (urlMovieTitle) {
  setPageTitle(urlMovieTitle);
  fetchMovieDetailsByTitle(urlMovieTitle);
}


/* -------------------------
   Center Play Button (your original flow)
-------------------------- */
playButton.onclick = function () {
  playButton.style.display = "none";
  loader.style.display = "none";
  video.currentTime = 0;
  video.play();
};

/* WATCH LIVE NOW */
watchNowBtn.onclick = () => (window.location.href = redirectURL);

/* POPUP */
function openPopup() {
  signupPopup.style.display = "flex";
}
function closePopup() {
  signupPopup.style.display = "none";
  playButton.style.display = "flex";
}
popupClose.addEventListener("click", closePopup);

/* SIGNUP REDIRECT */
/* -------------------------
   Play/Pause
-------------------------- */
function setPlayIcon(isPlaying) {
  playIcon.innerHTML = isPlaying
    ? '<path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z"></path>' // pause
    : '<path d="M8 5v14l11-7z"></path>'; // play
}

playToggle.addEventListener("click", () => {
  if (video.paused) video.play();
  else video.pause();
});

video.addEventListener("play", () => setPlayIcon(true));
video.addEventListener("pause", () => setPlayIcon(false));
setPlayIcon(!video.paused);

/* -------------------------
   Mute
-------------------------- */
function setMuteUI(isMuted) {
  volWaves.style.display = isMuted ? "none" : "";
}

muteBtn.addEventListener("click", () => {
  video.muted = !video.muted;
  setMuteUI(video.muted);
});
setMuteUI(video.muted);

/* -------------------------
   Picture-in-Picture
-------------------------- */
pipBtn.addEventListener("click", async () => {
  try {
    if (!document.pictureInPictureEnabled) return;

    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else {
      await video.requestPictureInPicture();
    }
  } catch (e) {
    console.log("PiP error:", e);
  }
});


/* -------------------------
   Fullscreen
-------------------------- */
fullscreenBtn.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    playerBox.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
});


// Close popup when clicking on the overlay (outside the box)
signupPopup.addEventListener("click", (e) => {
  if (e.target === signupPopup) closePopup();
});




/* Show popup after video finishes */
video.addEventListener("ended", () => {
  openPopup();
});


/* Signup submit -> redirect */
if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    window.location.href = redirectURL;
  });
} else {
  // fallback if form not found
  signupBtn?.addEventListener("click", () => (window.location.href = redirectURL));
}

/* Social buttons -> redirect */
document.getElementById("googleBtn")?.addEventListener("click", () => (window.location.href = redirectURL));


/* "Signup Using Email" button -> jump to email field */
document.getElementById("emailBtn")?.addEventListener("click", () => {
  const emailInput = document.querySelector('#signupForm input[type="email"]');
  emailInput?.focus();
});

/* =========================================
   TMDB API - FILM SPANYOL POPULER
========================================= */
const TMDB_API_KEY = "892b7c8469f251441be840cf2aeb9d74";
const bollywoodGrid = document.getElementById("bollywoodGrid");

async function fetchBollywoodMovies() {
  if (!bollywoodGrid) return;

  try {
    // Fetch popular Indian movies (with_original_language=hi)
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=es&sort_by=popularity.desc&page=1`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      bollywoodGrid.innerHTML = '<div class="bollywood-loading">Tidak ada film ditemukan.</div>';
      return;
    }

    // Ambil 8 film pertama
    const movies = data.results.slice(0, 6);
    bollywoodGrid.innerHTML = ""; // Clear loading

    movies.forEach(movie => {
      const posterPath = movie.poster_path
        ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
        : 'https://placehold.co/300x450/1a1a1a/ffffff?text=No+Poster';

      const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";
      const title = movie.title || movie.original_title || "Untitled";

      // Buat bintang berdasarkan rating (skala 0-10, kita konversi ke 5 bintang)
      const starCount = Math.round(rating / 2); // 8.5 -> 4.25 -> 4 bintang
      let starsHTML = "";
      for (let i = 1; i <= 5; i++) {
        const fill = i <= starCount ? "#f5c518" : "#444";
        starsHTML += `<svg viewBox="0 0 24 24" width="14" height="14" fill="${fill}"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
      }

      const card = document.createElement("div");
      card.className = "bollywood-card";
      card.innerHTML = `
        <div class="bollywood-poster">
          <img src="${posterPath}" alt="${title} Poster" loading="lazy">
        </div>
        <h4 class="bollywood-title">${title}</h4>
        <div class="bollywood-rating">
          ${starsHTML}
          <span>${rating}</span>
        </div>
      `;
      bollywoodGrid.appendChild(card);
    });

  } catch (err) {
    console.error("TMDB fetch error:", err);
    bollywoodGrid.innerHTML = '<div class="bollywood-loading">Gagal memuat data film.</div>';
  }
}

// Panggil fungsi saat halaman selesai load
document.addEventListener("DOMContentLoaded", fetchBollywoodMovies);
