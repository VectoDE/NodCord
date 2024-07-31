module.exports = {
    baseURL: process.env.BASE_URL || 'localhost',
    port: process.env.PORT || 3000,
    prefix: '/api',
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 Minuten
        max: 100 // Limit each IP to 100 requests per windowMs
    },
    corsOptions: {
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204
    }
};
