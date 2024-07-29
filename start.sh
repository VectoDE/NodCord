# Start NodCord with PM2
pm2 start src/api/app.js --name "NodCord"
pm2 start src/bot/bot.js --name "NodCordBot"
