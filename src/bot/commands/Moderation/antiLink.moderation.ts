import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

import prisma from '@/services/prisma.service';

import type { SlashCommandModule } from '@/bot/types';

type BypassPermission =
  | 'ManageChannels'
  | 'ManageGuild'
  | 'EmbedLinks'
  | 'AttachFiles'
  | 'ManageMessages'
  | 'Administrator';

const PERMISSION_CHOICES: Array<{ name: string; value: BypassPermission }> = [
  { name: 'Manage Channels', value: 'ManageChannels' },
  { name: 'Manage Server', value: 'ManageGuild' },
  { name: 'Embed Links', value: 'EmbedLinks' },
  { name: 'Attach Files', value: 'AttachFiles' },
  { name: 'Manage Messages', value: 'ManageMessages' },
  { name: 'Administrator', value: 'Administrator' },
];

const antiLinkCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('anti-link')
    .setDescription('Configure the anti-link system for this server.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((sub) =>
      sub
        .setName('setup')
        .setDescription('Enable the anti-link system with a bypass permission.')
        .addStringOption((option) =>
          option
            .setName('permission')
            .setDescription('Members with this permission will bypass the filter.')
            .setRequired(true)
            .addChoices(...PERMISSION_CHOICES),
        ),
    )
    .addSubcommand((sub) =>
      sub.setName('disable').setDescription('Disable the anti-link system for this server.'),
    )
    .addSubcommand((sub) =>
      sub.setName('check').setDescription('Check the current anti-link configuration.'),
    )
    .addSubcommand((sub) =>
      sub
        .setName('edit')
        .setDescription('Update the bypass permission for the anti-link system.')
        .addStringOption((option) =>
          option
            .setName('permission')
            .setDescription('Members with this permission will bypass the filter.')
            .setRequired(true)
            .addChoices(...PERMISSION_CHOICES),
        ),
    ),
  async execute(interaction) {
    if (!interaction.inGuild() || !interaction.guild) {
      await interaction.reply({
        content: 'This command can only be used inside a server.',
        ephemeral: true,
      });
      return;
    }

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.reply({
        content: 'You do not have permission to manage this feature.',
        ephemeral: true,
      });
      return;
    }

    const subcommand = interaction.options.getSubcommand() as
      | 'setup'
      | 'disable'
      | 'check'
      | 'edit';
    const guildId = interaction.guild.id;

    switch (subcommand) {
      case 'setup': {
        const permission = interaction.options.getString('permission', true) as BypassPermission;

        await prisma.antilink.upsert({
          where: { guild: guildId },
          update: { perms: permission, isEnabled: true },
          create: { guild: guildId, perms: permission, isEnabled: true },
        });

        const embed = new EmbedBuilder()
          .setColor('Blurple')
          .setDescription(
            `Anti-link system enabled. Members with **${permission}** permission will bypass the filter.`,
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        break;
      }
      case 'disable': {
        const existing = await prisma.antilink.findUnique({ where: { guild: guildId } });
        if (!existing || !existing.isEnabled) {
          await interaction.reply({
            content: 'The anti-link system is already disabled.',
            ephemeral: true,
          });
          return;
        }

        await prisma.antilink.update({
          where: { guild: guildId },
          data: { isEnabled: false },
        });

        await interaction.reply({
          content: 'Anti-link system has been disabled.',
          ephemeral: true,
        });
        break;
      }
      case 'check': {
        const existing = await prisma.antilink.findUnique({ where: { guild: guildId } });
        if (!existing || !existing.isEnabled) {
          await interaction.reply({
            content: 'The anti-link system is currently disabled.',
            ephemeral: true,
          });
          return;
        }

        const embed = new EmbedBuilder()
          .setColor('Blurple')
          .setDescription(
            `Anti-link system is **enabled**.\nBypass permission: **${existing.perms}**`,
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
        break;
      }
      case 'edit': {
        const permission = interaction.options.getString('permission', true) as BypassPermission;
        const existing = await prisma.antilink.findUnique({ where: { guild: guildId } });

        if (!existing) {
          await interaction.reply({
            content: 'The anti-link system is not set up yet. Use `/anti-link setup` first.',
            ephemeral: true,
          });
          return;
        }

        await prisma.antilink.update({
          where: { guild: guildId },
          data: { perms: permission, isEnabled: true },
        });

        await interaction.reply({
          content: `Updated bypass permission to **${permission}** and kept the system enabled.`,
          ephemeral: true,
        });
        break;
      }
    }
  },
};

export default antiLinkCommand;
