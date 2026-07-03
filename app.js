// app.js
document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const mediaGrid = document.getElementById("media-grid");
    const genreSelect = document.getElementById("genre-select");
    const searchInput = document.getElementById("search-input");
    const searchBtn = document.getElementById("search-btn");
    
    // Player Elements
    const controlsSection = document.getElementById("controls-section");
    const playerSection = document.getElementById("player-section");
    const backBtn = document.getElementById("back-btn");
    const playerTitle = document.getElementById("player-title");
    const serverSelect = document.getElementById("server-select");
    const tvControls = document.getElementById("tv-controls");
    const seasonSelect = document.getElementById("season-select");
    const episodeSelect = document.getElementById("episode-select");
    const streamFrame = document.getElementById("stream-frame");

    let currentItem = null;

    // Initialization
    async function init() {
        populateServers();
        
        if (AppConfig.METADATA_API_KEY === "YOUR_METADATA_API_KEY_HERE") {
            mediaGrid.innerHTML = "<p style='color:red;'>Please add your TMDB API key to config.js to load data.</p>";
            return;
        }

        await fetchGenres();
        await fetchTrending();
    }

    // Helper: Check if a content date is in the past or today
    function isReleased(dateString) {
        if (!dateString) return false; // Exclude if no release date exists
        const releaseDate = new Date(dateString);
        const today = new Date();
        // Reset time to midnight for accurate date-only comparison
        today.setHours(0, 0, 0, 0);
        return releaseDate <= today;
    }

    // Populate Server Dropdown from Config
    function populateServers() {
        serverSelect.innerHTML = "";
        Object.keys(AppConfig.STREAM_PROVIDERS).forEach(key => {
            const opt = document.createElement("option");
            opt.value = key;
            opt.textContent = AppConfig.STREAM_PROVIDERS[key].name;
            serverSelect.appendChild(opt);
        });
        serverSelect.value = AppConfig.DEFAULT_PROVIDER;
    }

    // API: Fetch Genres
    async function fetchGenres() {
        try {
            const res = await fetch(`${AppConfig.METADATA_BASE_URL}/genre/movie/list?api_key=${AppConfig.METADATA_API_KEY}`);
            const data = await res.json();
            
            data.genres.forEach(genre => {
                const opt = document.createElement("option");
                opt.value = genre.id;
                opt.textContent = genre.name;
                genreSelect.appendChild(opt);
            });
        } catch (err) {
            console.error("Failed to load genres", err);
        }
    }

    // API: Fetch Trending (Default View)
    async function fetchTrending() {
        try {
            const res = await fetch(`${AppConfig.METADATA_BASE_URL}/trending/all/week?api_key=${AppConfig.METADATA_API_KEY}`);
            const data = await res.json();
            renderGrid(data.results);
        } catch (err) {
            console.error("Failed to fetch trending", err);
        }
    }

    // API: Fetch by Genre
    async function fetchByGenre(genreId) {
        try {
            const res = await fetch(`${AppConfig.METADATA_BASE_URL}/discover/movie?api_key=${AppConfig.METADATA_API_KEY}&with_genres=${genreId}`);
            const data = await res.json();
            renderGrid(data.results);
        } catch (err) {
            console.error("Failed to fetch by genre", err);
        }
    }

    // API: Real Search
    async function handleSearch() {
        const query = searchInput.value.trim();
        if (!query) {
            fetchTrending();
            genreSelect.value = "trending";
            return;
        }

        try {
            const res = await fetch(`${AppConfig.METADATA_BASE_URL}/search/multi?api_key=${AppConfig.METADATA_API_KEY}&query=${encodeURIComponent(query)}`);
            const data = await res.json();
            const mediaOnly = data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
            renderGrid(mediaOnly);
            genreSelect.value = "trending"; 
        } catch (err) {
            console.error("Search failed", err);
        }
    }

    // API: Load Seasons for a TV Show
    async function loadSeasons(tvId) {
        try {
            const res = await fetch(`${AppConfig.METADATA_BASE_URL}/tv/${tvId}?api_key=${AppConfig.METADATA_API_KEY}`);
            const data = await res.json();
            
            seasonSelect.innerHTML = "";
            // Filter out "Specials" (season 0) and ensure the season itself has already aired
            const validSeasons = data.seasons ? data.seasons.filter(s => s.season_number > 0 && isReleased(s.air_date)) : [];
            
            if (validSeasons.length === 0) {
                seasonSelect.innerHTML = `<option value="1">Season 1</option>`;
                loadEpisodes(tvId, 1);
            } else {
                validSeasons.forEach(season => {
                    const opt = document.createElement("option");
                    opt.value = season.season_number;
                    opt.textContent = `Season ${season.season_number}`;
                    seasonSelect.appendChild(opt);
                });
                await loadEpisodes(tvId, seasonSelect.value);
            }
        } catch (err) {
            console.error("Failed to load seasons", err);
        }
    }

    // API: Load Episodes for a specific Season
    async function loadEpisodes(tvId, seasonNumber) {
        try {
            episodeSelect.innerHTML = "<option>Loading...</option>";
            const res = await fetch(`${AppConfig.METADATA_BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${AppConfig.METADATA_API_KEY}`);
            const data = await res.json();
            
            episodeSelect.innerHTML = "";
            
            // CRITICAL FIX: Filter out unreleased episodes
            const releasedEpisodes = data.episodes ? data.episodes.filter(ep => isReleased(ep.air_date)) : [];
            
            if (releasedEpisodes.length > 0) {
                releasedEpisodes.forEach(episode => {
                    const opt = document.createElement("option");
                    opt.value = episode.episode_number;
                    opt.textContent = `Episode ${episode.episode_number}: ${episode.name}`;
                    episodeSelect.appendChild(opt);
                });
            } else {
                const opt = document.createElement("option");
                opt.textContent = "No episodes released yet";
                episodeSelect.appendChild(opt);
            }
            
            updateStreamUrl();
        } catch (err) {
            console.error("Failed to load episodes", err);
        }
    }

    // Render Grid UI
    function renderGrid(items) {
        mediaGrid.innerHTML = "";
        
        // CRITICAL FIX: Filter out unreleased movies and TV shows completely from the UI
        const releasedItems = items.filter(item => {
            const targetDate = item.release_date || item.first_air_date;
            return isReleased(targetDate);
        });

        if (releasedItems.length === 0) {
            mediaGrid.innerHTML = "<p>No released titles found matching this criteria.</p>";
            return;
        }

        releasedItems.forEach(item => {
            const title = item.title || item.name;
            const type = item.media_type || (item.first_air_date ? "tv" : "movie"); 

            const card = document.createElement("div");
            card.className = "card";
            
            const imgSrc = item.poster_path 
                ? `${AppConfig.IMAGE_BASE_URL}${item.poster_path}` 
                : "https://via.placeholder.com/300x450?text=No+Poster";

            card.innerHTML = `
                <img src="${imgSrc}" alt="${title}" loading="lazy">
                <div class="card-title">${title} (${type === 'tv' ? 'TV' : 'Movie'})</div>
            `;

            card.addEventListener("click", () => openPlayer({
                id: item.id,
                title: title,
                type: type
            }));

            mediaGrid.appendChild(card);
        });
    }

    // Player Logic
    function openPlayer(item) {
        currentItem = item;
        
        mediaGrid.style.display = "none";
        controlsSection.style.display = "none";
        playerSection.style.display = "block";
        playerTitle.textContent = item.title;

        if (item.type === "tv") {
            tvControls.style.display = "flex";
            seasonSelect.innerHTML = "<option>Loading...</option>";
            episodeSelect.innerHTML = "<option>Loading...</option>";
            loadSeasons(item.id); 
        } else {
            tvControls.style.display = "none";
            updateStreamUrl();
        }

        window.scrollTo(0, 0); 
    }

    // Close Player
    function closePlayer() {
        currentItem = null;
        streamFrame.src = ""; 
        playerSection.style.display = "none";
        controlsSection.style.display = "block";
        mediaGrid.style.display = "grid";
    }

    // Construct streaming URL
    function updateStreamUrl() {
        if (!currentItem || !episodeSelect.value) return;

        const providerKey = serverSelect.value;
        const provider = AppConfig.STREAM_PROVIDERS[providerKey];
        let finalUrl = "";

        if (currentItem.type === "tv") {
            const s = seasonSelect.value || 1;
            const e = episodeSelect.value || 1;
            finalUrl = `${provider.tvUrl}${currentItem.id}/${s}/${e}`;
        } else {
            finalUrl = `${provider.movieUrl}${currentItem.id}`;
        }

        streamFrame.src = finalUrl;
    }

    // Event Listeners
    genreSelect.addEventListener("change", (e) => {
        if (e.target.value === "trending") {
            fetchTrending();
        } else {
            fetchByGenre(e.target.value);
        }
    });

    searchBtn.addEventListener("click", handleSearch);
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleSearch();
    });

    backBtn.addEventListener("click", closePlayer);
    serverSelect.addEventListener("change", updateStreamUrl);
    
    seasonSelect.addEventListener("change", (e) => {
        if (currentItem) {
            loadEpisodes(currentItem.id, e.target.value);
        }
    });
    
    episodeSelect.addEventListener("change", updateStreamUrl);

    // Boot
    init();
});
