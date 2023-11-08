export default {
    urlResolverTimeout: parseInt(process.env.URL_RESOLVER_TIMEOUT_SECONDS || '60'),
    googleDriveJwtKey: process.env.GOOGLE_DRIVE_JWT_KEY?.replace(/\\n/g, '\n') || '',
    googleDriveServiceAccountEmail: process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL || '',
    pusherChannelName: process.env.PUSHER_CHANNEL_NAME || 'media-catalog-netlify',
    pusherAppKey: process.env.PUSHER_APP_KEY || '',
    pusherAppCluster: process.env.PUSHER_APP_CLUSTER || 'us2',
    linksApiUrl: process.env.LINKS_API_URL || 'http://admin:admin@localhost:8000',
    plexHostIp: process.env.PLEX_HOST_IP || '127.0.0.1',
    plexPort: process.env.PLEX_HOST_PORT || 32400,
    plexApiToken: process.env.PLEX_API_TOKEN || '',
    plexMovieSectionName: process.env.PLEX_MOVIE_SECTION_NAME || 'PlexMovies',
    plexTvSectionName: process.env.PLEX_TV_SECTION_NAME || 'PlexTv',
    
}