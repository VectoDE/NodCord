const { GatewayIntentBits, Partials } = require('discord.js');

module.exports = {
    token: process.env.DISCORD_TOKEN || 'MTE3NDA5NjYwNzExMzkxMjM1MA.GEiw1q.edAbPTwWDjtAT36WRWObCYM1j3KOojc9NZBHQ4',
    prefix: process.env.BOT_PREFIX || '!',
    ownerID: process.env.OWNER_ID || 'your_discord_id',
    activity: {
        name: process.env.BOT_ACTIVITY_NAME || 'NodCord',
        type: process.env.BOT_ACTIVITY_TYPE || 'PLAYING' // WATCHING, LISTENING, etc.
    },
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildPresences,
    ],
    partials: [
        Partials.Message,
        Partials.GuildMessageReactions,
        Partials.Channel,
        Partials.MessageReactionAdd,
        Partials.MessageReactionRemove,
        Partials.Reaction,
        Partials.VoiceStateUpdate,
        Partials.GuildVoice,
    ],
};
