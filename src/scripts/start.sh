# Start NodCord with PM2
pm2 start src/api/app.js --name "nodcord"
pm2 start src/bot/bot.js --name "nodcordbot"
