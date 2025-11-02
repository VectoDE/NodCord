import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

import type { SlashCommandModule } from '@/bot/types';

const CUSTOM_EMOJI_REGEX = /^<a?:\w+:(\d+)>$/;

async function resolveEmojiUrl(input: string): Promise<string | null> {
  const trimmed = input.trim();
  const customMatch = trimmed.match(CUSTOM_EMOJI_REGEX);
  if (customMatch) {
    const emojiId = customMatch[1];
    const isAnimated = trimmed.startsWith('<a');
    const baseUrl = `https://cdn.discordapp.com/emojis/${emojiId}`;

    if (isAnimated) {
      const gifUrl = `${baseUrl}.gif?quality=lossless`;
      try {
        const response = await fetch(gifUrl, { method: 'HEAD' });
        if (response.ok) {
          return gifUrl;
        }
      } catch {
        // ignore and fall back to png
      }
    }

    return `${baseUrl}.png?quality=lossless`;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return null;
}

const stealEmojiCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('steal-emoji')
    .setDescription('Clone a custom emoji from another server.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions)
    .addStringOption((option) =>
      option
        .setName('emoji')
        .setDescription('Provide the custom emoji or direct image URL.')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription('The name to give the emoji once imported.')
        .setRequired(true)
        .setMaxLength(32),
    ),
  async execute(interaction) {
    if (!interaction.inGuild() || !interaction.guild) {
      await interaction.reply({
        content: 'This command can only be used inside a server.',
        ephemeral: true,
      });
      return;
    }

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuildExpressions)) {
      await interaction.reply({
        content: 'You need the Manage Emojis & Stickers permission to do that.',
        ephemeral: true,
      });
      return;
    }

    const rawEmoji = interaction.options.getString('emoji', true);
    const name = interaction.options.getString('name', true).trim();

    const emojiUrl = await resolveEmojiUrl(rawEmoji);
    if (!emojiUrl) {
      await interaction.reply({
        content: 'I can only import custom server emojis or direct image URLs.',
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const createdEmoji = await interaction.guild.emojis.create({ attachment: emojiUrl, name });

      const embed = new EmbedBuilder()
        .setColor('Blurple')
        .setDescription(
          `Successfully added ${createdEmoji} with the name **:${createdEmoji.name}:**.`,
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({
        content:
          'I could not add that emoji. Please ensure the image is below 256 KB and the server has available emoji slots.',
      });
    }
  },
};

export default stealEmojiCommand;
