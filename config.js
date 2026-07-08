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
        },
        // --- Newly Added Providers Below ---
        provider4: {
            name: "Vidfast Net",
            movieUrl: "https://vidfast.net/embed/movie/",
            tvUrl: "https://vidfast.net/embed/tv/"
        },
        provider5: {
            name: "Vidfast Pro",
            movieUrl: "https://vidfast.pro/embed/movie/",
            tvUrl: "https://vidfast.pro/embed/tv/"
        },
        provider6: {
            name: "Vidfast In",
            movieUrl: "https://vidfast.in/embed/movie/",
            tvUrl: "https://vidfast.in/embed/tv/"
        },
        provider7: {
            name: "Vidfast Io",
            movieUrl: "https://vidfast.io/embed/movie/",
            tvUrl: "https://vidfast.io/embed/tv/"
        },
        provider8: {
            name: "Vidfast Pm",
            movieUrl: "https://vidfast.pm/embed/movie/",
            tvUrl: "https://vidfast.pm/embed/tv/"
        },
        provider9: {
            name: "Vidfast Xyz",
            movieUrl: "https://vidfast.xyz/embed/movie/",
            tvUrl: "https://vidfast.xyz/embed/tv/"
        },
        provider10: {
            name: "VID Easy Net",
            movieUrl: "https://player.videasy.net/movie/", 
            tvUrl: "https://player.videasy.net/tv/"       
        },
        provider11: {
            name: "Vidnest Fun",
            movieUrl: "https://vidnest.fun/embed/movie/",
            tvUrl: "https://vidnest.fun/embed/tv/"
        },
        provider12: {
            name: "111 Movies",
            movieUrl: "https://111movies.net/movie/", 
            tvUrl: "https://111movies.net/tv/"
        },
        provider13: {
            name: "VS Embed RU",
            movieUrl: "https://vsembed.ru/embed/movie/",
            tvUrl: "https://vsembed.ru/embed/tv/"
        },
        provider14: {
            name: "VidSrc XYZ",
            movieUrl: "https://vidsrc.xyz/embed/movie/",
            tvUrl: "https://vidsrc.xyz/embed/tv/"
        },
        provider15: {
            name: "VidSrc Embed RU",
            movieUrl: "https://vidsrc-embed.ru/embed/movie/",
            tvUrl: "https://vidsrc-embed.ru/embed/tv/"
        },
        provider16: {
            name: "VidSrcMe SU",
            movieUrl: "https://vidsrcme.su/embed/movie/",
            tvUrl: "https://vidsrcme.su/embed/tv/"
        }
    },
    
    // Default fallback player settings
    DEFAULT_PROVIDER: "provider1"
};