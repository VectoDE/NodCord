require('dotenv').config();

module.exports = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  redirectUri: process.env.DISCORD_REDIRECT_URI,
  scope: [
    'bot',
    'guilds',
    'members',
    'message_content',
    'guild_messages',
    'guild_message_reactions',
  ],
  prefix: process.env.BOT_PREFIX || '!',
  ownerID: process.env.OWNER_ID || '335228120816943114',
  devGuild: process.env.DISCORD_DEV_GUILD_ID,
  activity: {
    name: process.env.BOT_ACTIVITY_NAME || 'NodCord',
    type: process.env.BOT_ACTIVITY_TYPE || 'PLAYING', // WATCHING, LISTENING, etc.
  },
};
