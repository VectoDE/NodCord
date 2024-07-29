module.exports = {
    token: process.env.DISCORD_TOKEN || 'your_discord_token',
    prefix: process.env.BOT_PREFIX || '!',
    ownerID: process.env.OWNER_ID || 'your_discord_id',
    activity: {
        name: process.env.BOT_ACTIVITY_NAME || 'NodCord',
        type: process.env.BOT_ACTIVITY_TYPE || 'PLAYING' // WATCHING, LISTENING, etc.
    },
    intents: [
        'GUILDS',
        'GUILD_MESSAGES',
        'DIRECT_MESSAGES',
        'GUILD_MEMBERS'
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION']
};