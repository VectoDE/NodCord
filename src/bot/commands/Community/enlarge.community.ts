import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import type { SlashCommandModule } from '@/bot/types';

function buildEmojiUrl(emoji: string): string | null {
  const custom = emoji.match(/^<a?:\w+:(\d+)>$/);
  if (!custom) {
    if (emoji.startsWith('https://')) {
      return emoji;
    }
    return null;
  }

  const [, id] = custom;
  const animated = emoji.startsWith('<a');
  const extension = animated ? 'gif' : 'png';
  return `https://cdn.discordapp.com/emojis/${id}.${extension}?quality=lossless`;
}

const enlargeCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('enlarge')
    .setDescription('Display a larger version of a custom emoji or image URL.')
    .addStringOption((option) =>
      option
        .setName('emoji')
        .setDescription('Custom emoji (e.g. :emoji:) or direct image URL.')
        .setRequired(true),
    ),
  async execute(interaction) {
    const rawInput = interaction.options.getString('emoji', true).trim();
    const imageUrl = buildEmojiUrl(rawInput);

    if (!imageUrl) {
      await interaction.reply({
        content: 'I can only enlarge custom server emojis or image URLs.',
        ephemeral: true,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('Random')
      .setDescription('Here is the enlarged emoji:')
      .setImage(imageUrl)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

export default enlargeCommand;
