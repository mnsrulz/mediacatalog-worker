export default {
    googleDriveJwtKey: process.env.GOOGLE_DRIVE_JWT_KEY?.replace(/\\n/g, '\n') || '',
    googleDriveServiceAccountEmail: process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL || '',
    pusherChannelName: process.env.PUSHER_CHANNEL_NAME || 'media-catalog-netlify',
    pusherAppKey: process.env.PUSHER_APP_KEY || '',
    pusherAppCluster: process.env.PUSHER_APP_CLUSTER || 'us2',
    linksApiUrl: process.env.LINKS_API_URL || 'http://admin:admin@localhost:8000'
}