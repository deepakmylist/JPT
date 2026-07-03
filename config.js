// config.js
const AppConfig = {
    // Metadata API Configuration (e.g., TMDB or custom metadata server)
    METADATA_API_KEY: "97eee83d11bb74a4cbb0b3a5e65fb67e",
    METADATA_BASE_URL: "https://api.themoviedb.org/3",
    IMAGE_BASE_URL: "https://image.tmdb.org/t/p/w500",
    HERO_IMAGE_BASE_URL: "https://image.tmdb.org/t/p/original",

    // Streaming Server Configurations
    // Replace placeholders with your intended streaming endpoints
    STREAM_PROVIDERS: {
        provider1: {
            name: "VID Easy",
            movieUrl: "https://player.videasy.to/movie/", // Appends IMDB_ID or TMDB_ID
            tvUrl: "https://player.videasy.to/tv/"       // Requires parsing season/episode
        },
        provider2: {
            name: "VS Embed",
            movieUrl: "https://vsembed.su/embed/movie/",
            tvUrl: "https://vsembed.su/embed/tv/"
        },
        provider3: {
            name: "Vid King",
            movieUrl: "https://www.vidking.net/embed/movie/",
            tvUrl: "https://www.vidking.net/embed/tv/"
        }
    },
    
    // Default fallback player settings
    DEFAULT_PROVIDER: "provider1"
};