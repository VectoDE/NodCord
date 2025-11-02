import { ChannelType, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

import type { Collection, Message, TextChannel } from 'discord.js';
import type { SlashCommandModule } from '@/bot/types';

const LINK_PATTERNS = [/https?:\/\//i, /discord\.gg\//i];

function isLinkMessage(message: Message<true>): boolean {
  return LINK_PATTERNS.some((pattern) => pattern.test(message.content));
}

const purgeLinksCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('purge-links')
    .setDescription('Delete recent messages that contain links.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Target channel (defaults to the current channel).')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false),
    )
    .addIntegerOption((option) =>
      option
        .setName('limit')
        .setDescription('How many recent messages to inspect (max 100).')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(100),
    ),
  async execute(interaction) {
    if (!interaction.inGuild() || !interaction.guild) {
      await interaction.reply({
        content: 'This command can only be used inside a server.',
        ephemeral: true,
      });
      return;
    }

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
      await interaction.reply({
        content: 'You do not have permission to manage messages.',
        ephemeral: true,
      });
      return;
    }

    const targetChannel = interaction.options.getChannel('channel') ?? interaction.channel ?? null;
    if (!targetChannel || targetChannel.type !== ChannelType.GuildText) {
      await interaction.reply({
        content: 'Please select a text channel to purge.',
        ephemeral: true,
      });
      return;
    }

    const channel = targetChannel as TextChannel;
    const limit = interaction.options.getInteger('limit') ?? 100;

    await interaction.deferReply({ ephemeral: true });

    let fetchedMessages: Collection<string, Message<true>>;
    try {
      fetchedMessages = await channel.messages.fetch({ limit });
    } catch {
      await interaction.editReply({ content: 'I was unable to fetch messages from that channel.' });
      return;
    }

    const messagesToDelete = fetchedMessages.filter((message) => isLinkMessage(message));

    if (messagesToDelete.size === 0) {
      await interaction.editReply({
        content: 'I did not find any recent messages containing links.',
      });
      return;
    }

    try {
      await channel.bulkDelete(messagesToDelete, true);
    } catch {
      await interaction.editReply({
        content:
          'I could not delete some messages. Please ensure they are newer than 14 days and that I have Manage Messages permission.',
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setDescription(
        `Removed **${messagesToDelete.size}** message${messagesToDelete.size === 1 ? '' : 's'} containing links.`,
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};

export default purgeLinksCommand;
