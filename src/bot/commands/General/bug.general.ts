import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { TextBasedChannel } from 'discord.js';

import type { SlashCommandModule } from '@/bot/types';

const REPORT_COOLDOWN_MS = 60_000;
const cooldownUsers = new Set<string>();

type SendableChannel = Extract<TextBasedChannel, { send: unknown }>;

function canSendMessages(channel: TextBasedChannel): channel is SendableChannel {
  return typeof (channel as { send?: unknown }).send === 'function';
}

const bugCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('bug')
    .setDescription('Report a bug or issue you discovered with the bot.')
    .addStringOption((option) =>
      option
        .setName('message')
        .setDescription('Describe the bug you encountered.')
        .setRequired(true),
    ),
  async execute(interaction, client) {
    if (!interaction.inGuild() || !interaction.guild) {
      await interaction.reply({
        content: 'This command can only be used inside a server.',
        ephemeral: true,
      });
      return;
    }

    const userId = interaction.user.id;
    if (cooldownUsers.has(userId)) {
      await interaction.reply({
        content: 'You are on a short cooldown. Please try again in a minute.',
        ephemeral: true,
      });
      return;
    }

    const message = interaction.options.getString('message', true).trim();
    if (message.length === 0) {
      await interaction.reply({
        content: 'Please provide a short description of the issue.',
        ephemeral: true,
      });
      return;
    }

    const reportChannelId = process.env['DISCORD_REPORT_CHANNEL'];
    if (!reportChannelId) {
      await interaction.reply({
        content: 'The report channel has not been configured yet.',
        ephemeral: true,
      });
      return;
    }

    const targetChannel = await client.channels.fetch(reportChannelId).catch(() => null);
    if (!targetChannel || !targetChannel.isTextBased()) {
      await interaction.reply({
        content: 'I could not find a valid report channel. Please contact an administrator.',
        ephemeral: true,
      });
      return;
    }

    if (!canSendMessages(targetChannel)) {
      await interaction.reply({
        content: 'The configured report channel does not allow sending messages.',
        ephemeral: true,
      });
      return;
    }

    const guildName = interaction.guild.name;
    const reportEmbed = new EmbedBuilder()
      .setColor('Blurple')
      .setTitle('New Bug Report')
      .addFields(
        { name: 'Server', value: `${guildName} (\`${interaction.guild.id}\`)` },
        { name: 'Reported by', value: `${interaction.user.tag} (\`${interaction.user.id}\`)` },
      )
      .setDescription(message)
      .setTimestamp();

    const acknowledgementEmbed = new EmbedBuilder()
      .setColor('Blurple')
      .setDescription('Thanks! Your report has been submitted to the development team.')
      .setTimestamp();

    await targetChannel.send({ embeds: [reportEmbed] });
    await interaction.reply({ embeds: [acknowledgementEmbed], ephemeral: true });
    await interaction.user.send({ embeds: [acknowledgementEmbed] }).catch(() => undefined);

    cooldownUsers.add(userId);
    setTimeout(() => cooldownUsers.delete(userId), REPORT_COOLDOWN_MS);
  },
};

export default bugCommand;
