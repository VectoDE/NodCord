import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Events,
  PermissionsBitField,
  type Message,
} from 'discord.js';

import type { BotEventModule, NodCordClient } from '@/bot/types';

const botPingEvent: BotEventModule<'messageCreate'> = {
  name: Events.MessageCreate,
  async execute(client: NodCordClient, message: Message) {
    if (message.author.bot) return;

    const clientId = process.env['DISCORD_CLIENT_ID'] ?? client.user?.id ?? '';
    if (!clientId) return;

    if (!message.content.startsWith(`<@${clientId}>`)) return;

    const pingEmbed = new EmbedBuilder()
      .setColor('Random')
      .setTitle('Who mentioned me?')
      .setDescription(
        `Hey there **${message.author.username}**, here is some useful information...`,
      )
      .setTimestamp()
      .setThumbnail(client.user?.displayAvatarURL() ?? null)
      .setFooter({ text: `Requested by ${message.author.username}` });

    const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${client.user?.id ?? clientId}&scope=bot&permissions=${PermissionsBitField.Flags.Administrator}`;

    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setEmoji('🤖')
        .setLabel('Invite Me')
        .setURL(inviteUrl)
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setEmoji('🛡️')
        .setLabel('Support Server')
        .setURL(process.env['DISCORD_SUPPORT_SERVER'] ?? 'https://discord.gg/')
        .setStyle(ButtonStyle.Link),
    );

    await message.reply({ embeds: [pingEmbed], components: [buttons] });
  },
};

export default botPingEvent;
