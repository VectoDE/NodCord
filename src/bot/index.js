const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, Events } = require(`discord.js`);
const fs = require('fs');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

client.commands = new Collection();
client.prefix = new Map();

require('dotenv').config();
const botConfig = require('../config/botConfig');

const functions = fs.readdirSync("./src/bot/functions").filter(file => file.endsWith(".js"));
const eventFiles = fs.readdirSync("./src/bot/events").filter(file => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./src/bot/commands");
const prefixFolders = fs.readdirSync("./src/bot/prefix").filter((f) => f.endsWith(".js"));

for (arx of prefixFolders) {
  const Cmd = require('./prefix/' + arx)
  client.prefix.set(Cmd.name, Cmd)
}

const start = () => {
  (async () => {
    for (file of functions) {
      require(`./functions/${file}`)(client);
    }
    client.handleEvents(eventFiles, "./src/bot/events");
    client.handleCommands(commandFolders, "./src/bot/commands");
    client.login(botConfig.token)
  })();
}

// Fetch members for all guilds
const getMembers = async () => {
  let memberData = [];
  try {
    for (const guild of client.guilds.cache.values()) {
      const members = await guild.members.fetch();
      members.forEach(member => {
        memberData.push({
          guild: guild.name,
          username: member.user.username,
          displayName: member.displayName,
          avatar: member.user.displayAvatarURL(),
          badges: member.user.flags.toArray(), // Ensure this is correct for your Discord.js version
          hashname: member.user.id
        });
      });
    }
  } catch (error) {
    console.error('Error fetching members:', error);
  }
  return memberData;
};

// Fetch servers and member data
const getServers = async () => {
  let serverData = [];
  try {
    for (const guild of client.guilds.cache.values()) {
      // Abrufen der Guild-Besitzerinformationen
      const owner = await client.users.fetch(guild.ownerId);

      // Abrufen der Mitgliederinformationen
      const members = await guild.members.fetch();

      // Extrahieren der Mitgliederdaten
      const memberData = members.map(member => ({
        avatar: member.user.displayAvatarURL(),
        username: member.user.username,
        displayName: member.displayName,
        badges: member.user.flags.toArray(), // Badges abrufen
        hashname: `${member.user.username}#${member.user.discriminator}`
      }));

      // Hinzufügen der Serverdaten und der Mitglieder
      serverData.push({
        id: guild.id,
        name: guild.name,
        icon: guild.iconURL(), // URL des Server-Icons
        owner: owner ? owner.username : 'Unknown', // Besitzername
        createdAt: guild.createdAt, // Erstellungsdatum
        members: memberData // Mitgliederdaten
      });
    }
  } catch (error) {
    console.error('Error fetching servers:', error);
  }

  return serverData;
};

//Prefix Commands MessageCreate
client.on('messageCreate', async message => {
  const prefix = process.env.BOT_PREFIX;

  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  const prefixcmd = client.prefix.get(command);
  if (prefixcmd) {
    prefixcmd.run(client, message, args)
  }
});

//Join Role
const joinrole = require('../models/joinroleModel');
client.on(Events.GuildMemberAdd, async (member, guild) => {
  const role = await joinrole.findOne({ Guild: member.guild.id });
  if (!role) return;
  const giverole = member.guild.roles.cache.get(role.RoleID);
  member.roles.add(giverole);
})

//Anti link system
const linkSchema = require('../models/linkModel');
client.on(Events.MessageCreate, async message => {
  if (message.content.startsWith('http') || message.content.startsWith('discord.gg') || message.content.includes('discord.gg/') || message.content.includes('https://')) {
    const Data = await linkSchema.findOne({ Guild: message.guild.id });

    if (!Data) return;

    const memberPerms = Data.Perms;

    const user = message.author;
    const member = message.guild.members.cache.get(user.id);
    if (member.permissions.has(memberPerms)) return;
    else {
      (await message.channel.send({ content: `${message.author}, you can't send links here ` })).then(msg => {
        setTimeout(() => msg.delete(), 3000)
      });
      (await message).delete();
    }
  }
});

module.exports = {
  start,
  getMembers,
  getServers
};
