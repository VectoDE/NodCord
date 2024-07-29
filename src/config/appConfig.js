module.exports = {
    mongoURI: process.env.MONGO_URI || 'your_mongo_connection_string',
    sessionSecret: process.env.SESSION_SECRET || 'your_session_secret',
    logLevel: process.env.LOG_LEVEL || 'info',
    publicPath: 'src/public',
    viewsPath: 'src/api/views',
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
    serverName: process.env.SERVER_NAME || 'NodCord'
};