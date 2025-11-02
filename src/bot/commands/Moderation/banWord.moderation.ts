import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

import prisma from '@/services/prisma.service';

import type { SlashCommandModule } from '@/bot/types';

type BannedWordRecord = { word: string };

const banWordCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('ban-word')
    .setDescription('Manage banned words for this server.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand((sub) =>
      sub
        .setName('add')
        .setDescription('Ban a new word.')
        .addStringOption((option) =>
          option
            .setName('word')
            .setDescription('The word to ban.')
            .setRequired(true)
            .setMaxLength(100),
        ),
    )
    .addSubcommand((sub) => sub.setName('list').setDescription('List the currently banned words.'))
    .addSubcommand((sub) =>
      sub
        .setName('remove')
        .setDescription('Remove a word from the ban list.')
        .addStringOption((option) =>
          option.setName('word').setDescription('The word to unban.').setRequired(true),
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

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
      await interaction.reply({
        content: 'You do not have permission to manage banned words.',
        ephemeral: true,
      });
      return;
    }

    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === 'list') {
      const words = (await prisma.word.findMany({
        where: { guildId, isActive: true },
        orderBy: { createdAt: 'asc' },
      })) as BannedWordRecord[];

      if (words.length === 0) {
        await interaction.reply({ content: 'No words are currently banned.', ephemeral: true });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor('Blurple')
        .setTitle('Banned Words')
        .setDescription(words.map((wordRecord) => `• ||${wordRecord.word}||`).join('\n'))
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    if (sub === 'remove') {
      const wordInput = interaction.options.getString('word', true).trim().toLowerCase();

      const existing = await prisma.word.findFirst({
        where: { guildId, word: wordInput, isActive: true },
      });

      if (!existing) {
        await interaction.reply({
          content: `||${wordInput}|| is not currently banned.`,
          ephemeral: true,
        });
        return;
      }

      await prisma.word.update({
        where: { id: existing.id },
        data: { isActive: false },
      });

      await interaction.reply({
        content: `Removed ||${wordInput}|| from the ban list.`,
        ephemeral: true,
      });
      return;
    }

    // sub === "add"
    const wordInput = interaction.options.getString('word', true).trim().toLowerCase();

    const existing = await prisma.word.findFirst({
      where: { guildId, word: wordInput, isActive: true },
    });

    if (existing) {
      await interaction.reply({ content: `||${wordInput}|| is already banned.`, ephemeral: true });
      return;
    }

    await prisma.word.create({
      data: {
        guildId,
        word: wordInput,
      },
    });

    await interaction.reply({
      content: `||${wordInput}|| has been added to the ban list.`,
      ephemeral: true,
    });
  },
};

export default banWordCommand;
