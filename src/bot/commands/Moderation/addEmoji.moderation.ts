import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

import type { GuildEmoji } from 'discord.js';
import type { SlashCommandModule } from '@/bot/types';

const MAX_EMOJI_NAME_LENGTH = 32;

const addEmojiCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('addemoji')
    .setDescription('Add a custom emoji to this server.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addAttachmentOption((option) =>
      option
        .setName('emoji')
        .setDescription('The image file to use for the emoji.')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription('The name that will be used for this emoji.')
        .setRequired(true)
        .setMaxLength(MAX_EMOJI_NAME_LENGTH),
    ),
  async execute(interaction) {
    if (!interaction.inGuild() || !interaction.guild) {
      await interaction.reply({
        content: 'This command can only be used inside a server.',
        ephemeral: true,
      });
      return;
    }

    const attachment = interaction.options.getAttachment('emoji', true);
    const rawName = interaction.options.getString('name', true).trim();

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.reply({
        content: 'You do not have permission to manage emojis in this server.',
        ephemeral: true,
      });
      return;
    }

    if (
      !rawName.match(/^[\w-]+$/u) ||
      rawName.length === 0 ||
      rawName.length > MAX_EMOJI_NAME_LENGTH
    ) {
      await interaction.reply({
        content:
          'Please provide a valid emoji name (letters, numbers, underscores and dashes only).',
        ephemeral: true,
      });
      return;
    }

    if (!attachment.contentType?.startsWith('image/')) {
      await interaction.reply({
        content: 'Only image files can be used to create emojis.',
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const createdEmoji: GuildEmoji = await interaction.guild.emojis.create({
        name: rawName,
        attachment: attachment.url,
      });

      const embed = new EmbedBuilder()
        .setColor('Blurple')
        .setDescription(
          `Emoji ${createdEmoji} (\`:${createdEmoji.name}:\`) has been added successfully.`,
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({
        content:
          'I was unable to add that emoji. Please ensure the file is a valid image and try again.',
      });
    }
  },
};

export default addEmojiCommand;
