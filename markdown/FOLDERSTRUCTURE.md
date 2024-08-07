```javascript
NodCord/
├── .gitignore
├── LICENSE
├── README.md
├── package.json
├── yarn.lock
├── src/
│   ├── api/
│   │   ├── app.js
│   │   ├── controllers/
│   │   │   ├── apiController.js
│   │   │   ├── authController.js
│   │   │   ├── roleController.js
│   │   │   ├── userController.js
│   │   │   ├── blogController.js
│   │   │   ├── categoryController.js
│   │   │   ├── tagController.js
│   │   │   ├── teamController.js
│   │   │   ├── organizationController.js
│   │   │   ├── discordbotController.js
│   │   │   ├── productController.js
│   │   │   ├── companyController.js
│   │   │   ├── gameController.js
│   │   │   ├── projectController.js
│   │   │   ├── taskController.js
│   │   │   ├── paymentController.js
│   │   │   ├── groupController.js
│   │   │   ├── chatController.js
│   │   │   └── favoritesController.js
│   │   ├── routes/
│   │   │   ├── api.js
│   │   │   ├── authRoutes.js
│   │   │   ├── roleRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── blogRoutes.js
│   │   │   ├── categoryRoutes.js
│   │   │   ├── tagRoutes.js
│   │   │   ├── teamRoutes.js
│   │   │   ├── organizationRoutes.js
│   │   │   ├── discordbotRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── companyRoutes.js
│   │   │   ├── gameRoutes.js
│   │   │   ├── projectRoutes.js
│   │   │   ├── taskRoutes.js
│   │   │   ├── paymentRoutes.js
│   │   │   ├── groupRoutes.js
│   │   │   ├── chatRoutes.js
│   │   │   └── favoritesRoutes.js
│   │   ├── middlewares/
│   │   │   ├── compressionMiddleware.js
│   │   │   ├── authMiddleware.js
│   │   │   ├── roleMiddleware.js
│   │   │   ├── corsMiddleware.js
│   │   │   └── rateLimiterMiddleware.js
│   │   ├── services/
│   │   │   ├── socketioService.js
│   │   │   └── loggerService.js
│   │   ├── utils/
│   │   │   └── multerUtil.js
│   │   ├── plugins/
│   │   ├── views/
│   │   │   ├── index.ejs
│   │   │   ├── dashboard.ejs
│   │   │   ├── info.ejs
│   │   │   ├── status.ejs
│   │   │   └── error.ejs
│   ├── bot/
│   │   ├── commands/
│   │   │   ├── moderation/
│   │   │   │   ├── kick.js
│   │   │   │   ├── ban.js
│   │   │   │   ├── timeout.js
│   │   │   │   ├── bans.js
│   │   │   │   ├── kicks.js
│   │   │   │   ├── timeouts.js
│   │   │   │   ├── unban.js
│   │   │   │   └── untimeout.js
│   │   │   ├── fun/
│   │   │   │   ├── joke.js
│   │   │   │   ├── meme.js
│   │   │   │   └── roll.js
│   │   │   ├── utility/
│   │   │   │   ├── info.js
│   │   │   │   ├── ping.js
│   │   │   │   ├── server.js
│   │   │   │   ├── help.js
│   │   │   │   └── stats.js
│   │   │   ├── music/
│   │   │   │   ├── play.js
│   │   │   │   ├── pause.js
│   │   │   │   ├── skip.js
│   │   │   │   ├── stop.js
│   │   │   │   └── queue.js
│   │   │   └── games/
│   │   │       ├── trivia.js
│   │   │       ├── hangman.js
│   │   │       └── guessNumber.js
│   │   ├── events/
│   │   │   ├── ready.js
│   │   │   ├── messageCreate.js
│   │   │   ├── interactionCreate.js
│   │   │   ├── guildMemberAdd.js
│   │   │   ├── guildMemberRemove.js
│   │   │   ├── guildBanAdd.js
│   │   │   ├── guildBanRemove.js
│   │   │   ├── messageUpdate.js
│   │   │   ├── messageDelete.js
│   │   │   ├── roleCreate.js
│   │   │   ├── roleDelete.js
│   │   │   ├── channelCreate.js
│   │   │   ├── channelDelete.js
│   │   │   ├── emojiCreate.js
│   │   │   ├── emojiDelete.js
│   │   │   └── voiceStateUpdate.js
│   │   ├── functions/
│   │   │   ├── eventHandler.js
│   │   │   └── commandHandler.js
│   │   └── index.js
│   ├── config/
│   │   ├── apiConfig.js
│   │   ├── botConfig.js
│   │   └── serverConfig.js
│   ├── database/
│   │   └── connectDB.js
│   ├── models/
│   │   ├── role.js
│   │   ├── user.js
│   │   ├── blog.js
│   │   ├── category.js
│   │   ├── tag.js
│   │   ├── team.js
│   │   ├── organization.js
│   │   ├── discordbot.js
│   │   ├── kick.js
│   │   ├── ban.js
│   │   ├── timeout.js
│   │   ├── product.js
│   │   ├── company.js
│   │   ├── game.js
│   │   ├── project.js
│   │   ├── task.js
│   │   ├── payment.js
│   │   ├── group.js
│   │   ├── chat.js
│   │   └── favorites.js
│   ├── public/
│   │   ├── assets/
│   │   │   ├── css/
│   │   │   │   └── styles.css
│   │   │   ├── img/
│   │   │   └── js/
│   │   │       └── script.js
│   │   ├── uploads/
│   │   ├── storage/
│   │   └── json/
│   ├── dist/
│   │   ├── main.js
│   │   ├── main.js.map
│   │   ├── vendor.js
│   │   ├── vendor.js.map
│   │   ├── styles.css
│   │   └── styles.css.map
│   ├── build.js
│   └── server.js
```
