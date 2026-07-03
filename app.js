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
            // Filter out "Specials" (season 0) which usually aren't hosted on these providers
            const validSeasons = data.seasons ? data.seasons.filter(s => s.season_number > 0) : [];
            
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
                // Automatically load episodes for the first season in the dropdown
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
            if (data.episodes && data.episodes.length > 0) {
                data.episodes.forEach(episode => {
                    const opt = document.createElement("option");
                    opt.value = episode.episode_number;
                    // Include the episode name in the dropdown for better UX
                    opt.textContent = `Episode ${episode.episode_number}: ${episode.name}`;
                    episodeSelect.appendChild(opt);
                });
            } else {
                episodeSelect.innerHTML = `<option value="1">Episode 1</option>`;
            }
            
            // Once episodes are loaded, fire up the stream
            updateStreamUrl();
        } catch (err) {
            console.error("Failed to load episodes", err);
        }
    }

    // Render Grid UI
    function renderGrid(items) {
        mediaGrid.innerHTML = "";
        if (items.length === 0) {
            mediaGrid.innerHTML = "<p>No results found.</p>";
            return;
        }

        items.forEach(item => {
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
            
            // Fetch seasons, which will subsequently fetch episodes and update the URL
            loadSeasons(item.id); 
        } else {
            tvControls.style.display = "none";
            updateStreamUrl();
        }

        window.scrollTo(0, 0); 
    }

    function closePlayer() {
        currentItem = null;
        streamFrame.src = ""; 
        playerSection.style.display = "none";
        controlsSection.style.display = "block";
        mediaGrid.style.display = "grid";
    }

    // Construct streaming URL based on configs and inputs
    function updateStreamUrl() {
        if (!currentItem) return;

        const providerKey = serverSelect.value;
        const provider = AppConfig.STREAM_PROVIDERS[providerKey];
        let finalUrl = "";

        if (currentItem.type === "tv") {
            // Read from the newly populated selects
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
    
    // When a new season is selected, fetch the episodes for that specific season
    seasonSelect.addEventListener("change", (e) => {
        if (currentItem) {
            loadEpisodes(currentItem.id, e.target.value);
        }
    });
    
    // When a new episode is selected, just update the iframe URL
    episodeSelect.addEventListener("change", updateStreamUrl);

    // Boot
    init();
});