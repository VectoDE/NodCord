const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionsBitField,
  Permissions,
  MessageManager,
  Embed,
  Collection,
  Events,
} = require(`discord.js`);
const fs = require('fs');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();
client.prefix = new Map();

// Services & Config
require('dotenv').config();
const botConfig = require('../config/botConfig');
const logger = require('../api/services/loggerService');

// Handle functions
const functions = fs
  .readdirSync('./src/bot/functions')
  .filter((file) => file.endsWith('.js'));
const eventFiles = fs
  .readdirSync('./src/bot/events')
  .filter((file) => file.endsWith('.js'));
const commandFolders = fs.readdirSync('./src/bot/commands');
const prefixFolders = fs
  .readdirSync('./src/bot/prefix')
  .filter((f) => f.endsWith('.js'));

for (arx of prefixFolders) {
  const Cmd = require('./prefix/' + arx);
  client.prefix.set(Cmd.name, Cmd);
}

// Handle start
const startBot = () => {
  (async () => {
    for (file of functions) {
      require(`./functions/${file}`)(client);
    }
    client.handleEvents(eventFiles, './src/bot/events');
    client.handleCommands(commandFolders, './src/bot/commands');
    await client.login(botConfig.token);

    client.token = botConfig.token;
  })();
};

// Prefix Command Handler
client.on('messageCreate', async (message) => {
  const prefix = process.env.DISCORD_BOT_PREFIX;

  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  const prefixcmd = client.prefix.get(command);
  if (prefixcmd) {
    prefixcmd.run(client, message, args);
  }
});

// Get informations to frontend
const getBots = async () => {
  let botData = [];
  try {
    for (const guild of client.guilds.cache.values()) {
      const members = await guild.members.fetch();
      for (const member of members.values()) {
        if (member.user.bot) {
          const presence = member.presence || {};
          const status = presence.status || 'offline';
          const activities = presence.activities || [];
          const activityNames = activities.length > 0 ? activities.map(activity =>
            `${activity.type === 0 ? 'Playing' : activity.type === 1 ? 'Streaming' : activity.type === 2 ? 'Listening' : 'Watching'}: ${activity.name}`
          ).join(', ') : 'none';

          const inviteLink = await client.generateInvite({
            scopes: ['bot'],
            permissions: [
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory
            ],
          });

          botData.push({
            token: client.token,
            guild: guild.name,
            guildId: guild.id,
            username: member.user.username,
            displayName: member.displayName,
            avatar: member.user.displayAvatarURL(),
            hashname: `${member.user.username}#${member.user.discriminator}`,
            id: member.user.id,
            botCreationDate: new Date(member.user.createdTimestamp).toISOString(),
            botStatus: status,
            botActivity: activityNames,
            botJoinedAt: member.joinedAt ? new Date(member.joinedAt).toISOString() : 'N/A',
            botPermissions: member.permissions.toArray().join(', '),
            botTag: member.user.tag,
            botPresence: status,
            inviteLink: inviteLink,
          });
        }
      }
    }
  } catch (error) {
    logger.error('[BOT] Error fetching bots:', error);
  }
  return { botData };
};

const getMembers = async () => {
  let memberData = [];

  try {
    for (const guild of client.guilds.cache.values()) {
      const members = await guild.members.fetch();

      members.forEach((member) => {
        const usernameWithHash = member.user.tag;
        const hashname = usernameWithHash.includes('#') ? usernameWithHash.split('#')[1] : 'N/A';

        memberData.push({
          id: member.id,
          username: member.user.username,
          displayName: member.displayName,
          avatar: member.user.displayAvatarURL(),
          badges: member.user.flags?.toArray() || [],
          hashname: hashname,
          profileUrl: `https://discord.com/users/${member.user.id}`,
          canSendFriendRequest: true,
        });
      });
    }
  } catch (error) {
    logger.error('[BOT] Error fetching members:', error);
  }

  return { memberData };
};

const getServers = async () => {
  let serverData = [];
  try {
    for (const guild of client.guilds.cache.values()) {
      const owner = await client.users.fetch(guild.ownerId);

      let inviteLink;
      try {
        const invites = await guild.invites.fetch();
        if (invites.size > 0) {
          inviteLink = invites.first().url;
        } else {
          const channel = guild.channels.cache.find(channel =>
            channel.type === 'GUILD_TEXT' && channel.permissionsFor(guild.me).has('CREATE_INSTANT_INVITE')
          );
          if (channel) {
            const invite = await channel.createInvite({ maxAge: 0, maxUses: 0 });
            inviteLink = invite.url;
          }
        }
      } catch (err) {
        logger.error(`[BOT] Error fetching or creating invite for guild ${guild.id}:`, err);
        inviteLink = 'No invite available';
      }

      serverData.push({
        id: guild.id,
        name: guild.name,
        icon: guild.iconURL(),
        owner: owner ? owner.username : 'Unknown',
        createdAt: guild.createdAt,
        memberCount: guild.memberCount,
        inviteLink: inviteLink || 'No invite available',
      });
    }
  } catch (error) {
    logger.error('[BOT] Error fetching servers:', error);
  }

  return { serverData };
};

// Join Role System
const joinrole = require('../models/joinroleModel');
client.on(Events.GuildMemberAdd, async (member, guild) => {
  const role = await joinrole.findOne({ Guild: member.guild.id });
  if (!role) return;
  const giverole = member.guild.roles.cache.get(role.RoleID);
  member.roles.add(giverole);
});

// Anti Link System
const linkSchema = require('../models/antilinkModel');
client.on(Events.MessageCreate, async (message) => {
  if (
    message.content.startsWith('http') ||
    message.content.startsWith('discord.gg') ||
    message.content.includes('discord.gg/') ||
    message.content.includes('https://')
  ) {
    const Data = await linkSchema.findOne({ Guild: message.guild.id });

    if (!Data) return;

    const memberPerms = Data.Perms;

    const user = message.author;
    const member = message.guild.members.cache.get(user.id);
    if (member.permissions.has(memberPerms)) return;
    else {
      (
        await message.channel.send({
          content: `${message.author}, you can't send links here `,
        })
      ).then((msg) => {
        setTimeout(() => msg.delete(), 3000);
      });
      (await message).delete();
    }
  }
});

// AFK System
const afkSchema = require('../models/afkModel');
client.on(Events.MessageCreate, async message => {
  if(message.author.bot) return;
  const check = await afkSchema.findOne({ Guild: message.guild.id, User: message.author.id });
  if(check) {
    await afkSchema.deleteMany({ Guild: message.guild.id, User: message.author.id });
    const m1 = await message.reply({ content: `Welcome back, ${message.author}! I have removed your AFK.` });
  } else {
    const members = message.mentions.users.first();
    if(!members) return;
    const Data = await afkSchema.findOne({ Guild: message.guild.id, User: members.id });
    if(!Data) return;

    const member = message.guild.members.cache.get(members.id);
    const msg = Data.Message || "I'm AFK!";
    if(message.content.includes(members)) {
      const m = await message.reply({ content: `${member.user.tag} is currently AFK - Reason: **${msg}**.` })
    }
  }
});

// Embed Builder
client.on(Events.InteractionCreate, async (interaction) => {
  if(!interaction.isModalSubmit()) return;

  if(interaction.customId == 'modal') {
    const title = interaction.fields.getTextInputValue('title');
    const description = interaction.fields.getTextInputValue('description');
    const color = interaction.fields.getTextInputValue('color');
    const image = interaction.fields.getTextInputValue('image_link');
    const thumbnail_link = interaction.fields.getTextInputValue('thumbnail_link');

    const embed = new EmbedBuilder()
    .setTitle(`${title}`)
    .setDescription(`${description}`)
    .setColor(`${color}`)
    .setImage(`${image}`)
    .setThumbnail(`${thumbnail_link}`);

    await interaction.reply({ embeds: [embed] });
  }
});

// Autoresponder System
const responderSchema = require('../models/autoresponderModel');
client.on('messageCreate', async (message) => {
  const data = await responderSchema.findOne({ guildId: message.guild.id });
  if(!data) return;
  if(message.author.bot) return;

  const msg = message.content;
  for (const d of data.autoresponses) {
    const trigger = d.trigger;
    const response = d.response;

    if(msg === trigger) {
      message.reply(response)
      break;
    }
  }
});

// Bad Words System
const WordSchema = require('../models/wordModel');
client.on('messageCreate', async (message) => {
  if(message.author.bot || !message.guild) return;

  const guildId = message.guild.id;
  const content = message.content.toLowerCase();

  try {
    const bannedWords = await WordSchema.find({ guildId });
    const foundBannedWord = bannedWords.some(wordObj => content.includes(wordObj.word.toLowerCase()));

    if(foundBannedWord) {
      await message.delete();
      await message.author.send('Your message contained a banned word and has been deleted.')
    }
  } catch (error) {
    logger.error('[BOT] Error checking banned words:', error);
  }
})

module.exports = {
  startBot,
  getMembers,
  getServers,
  getBots,
};
