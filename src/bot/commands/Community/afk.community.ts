import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import axios from 'axios';

import type { SlashCommandModule } from '@/bot/types';
import {
  setAfkStatus,
  clearAfkStatus,
  fetchAfkStatus,
  setCacheEntry,
  type AfkStatus,
} from '@/bot/services/afk.service';
import logger from '@/services/logger.service';

const COLOR_PRIMARY = 0x5865f2;
const COLOR_SUCCESS = 0x57f287;
const COLOR_WARNING = 0xfacc15;

function buildSuccessEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder().setColor(COLOR_SUCCESS).setTitle(title).setDescription(description);
}

function buildInfoEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder().setColor(COLOR_PRIMARY).setTitle(title).setDescription(description);
}

function buildWarningEmbed(description: string): EmbedBuilder {
  return new EmbedBuilder().setColor(COLOR_WARNING).setDescription(description);
}

function unixTimestamp(dateIso: string | Date): number {
  const ms = dateIso instanceof Date ? dateIso.getTime() : new Date(dateIso).getTime();
  return Math.floor(ms / 1000);
}

const afkCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Manage your AFK status in this server.')
    .addSubcommand((command) =>
      command
        .setName('set')
        .setDescription('Set or update your AFK message.')
        .addStringOption((option) =>
          option
            .setName('message')
            .setDescription('Optional reason for being AFK.')
            .setRequired(false),
        ),
    )
    .addSubcommand((command) => command.setName('clear').setDescription('Remove your AFK status.'))
    .addSubcommand((command) =>
      command
        .setName('status')
        .setDescription('Show AFK status for yourself or another member.')
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('User to inspect (defaults to yourself).')
            .setRequired(false),
        ),
    ),
  async execute(interaction) {
    if (!interaction.inGuild() || !interaction.guildId) {
      await interaction.reply({
        embeds: [buildWarningEmbed('This command can only be used inside a guild.')],
        ephemeral: true,
      });
      return;
    }

    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'set') {
      const message = interaction.options.getString('message')?.trim() || "I'm currently AFK.";

      await interaction.deferReply({ ephemeral: true });

      try {
        const status = await setAfkStatus(guildId, userId, message);
        if (status) {
          setCacheEntry(guildId, userId, status);
          const since = unixTimestamp(status.setAt);
          const embed = buildSuccessEmbed(
            'AFK enabled',
            `Reason: **${status.message}**\nSince: <t:${since}:F> (<t:${since}:R>)`,
          );
          await interaction.editReply({ embeds: [embed] });
        } else {
          await interaction.editReply({
            embeds: [buildWarningEmbed('Unable to persist AFK status. Please try again later.')],
          });
        }
      } catch (error) {
        logger.error('[AFK] Failed to set AFK status', { guildId, userId, error });
        const reason = axios.isAxiosError(error)
          ? error.response?.data?.message ?? error.message
          : 'Unable to reach the AFK service.';
        await interaction.editReply({ embeds: [buildWarningEmbed(reason)] });
      }
      return;
    }

    if (subcommand === 'clear') {
      await interaction.deferReply({ ephemeral: true });

      try {
        const existing = await fetchAfkStatus(guildId, userId);
        if (!existing) {
          await interaction.editReply({ embeds: [buildWarningEmbed('You are not marked as AFK.')] });
          return;
        }

        await clearAfkStatus(guildId, userId);
        await interaction.editReply({ embeds: [buildSuccessEmbed('AFK removed', 'Welcome back!')] });
      } catch (error) {
        logger.error('[AFK] Failed to clear AFK status', { guildId, userId, error });
        const reason = axios.isAxiosError(error)
          ? error.response?.data?.message ?? error.message
          : 'Unable to reach the AFK service.';
        await interaction.editReply({ embeds: [buildWarningEmbed(reason)] });
      }
      return;
    }

    if (subcommand === 'status') {
      const target = interaction.options.getUser('user') ?? interaction.user;
      await interaction.deferReply({ ephemeral: true });

      try {
        const status = await fetchAfkStatus(guildId, target.id);
        if (!status) {
          await interaction.editReply({
            embeds: [buildWarningEmbed(`${target.tag} is currently not marked as AFK.`)],
          });
          return;
        }

        const since = unixTimestamp(status.setAt);
        const embed = buildInfoEmbed(
          `${target.username} is AFK`,
          `Reason: **${status.message}**\nSet: <t:${since}:F> (<t:${since}:R>)`,
        );
        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        logger.error('[AFK] Failed to fetch AFK status', { guildId, target: target.id, error });
        const reason = axios.isAxiosError(error)
          ? error.response?.data?.message ?? error.message
          : 'Unable to reach the AFK service.';
        await interaction.editReply({ embeds: [buildWarningEmbed(reason)] });
      }
      return;
    }

    await interaction.reply({
      embeds: [buildWarningEmbed('Unknown subcommand.')],
      ephemeral: true,
    });
  },
};

export default afkCommand;
