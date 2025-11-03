import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import type { SlashCommandModule } from '@/bot/types';

const COLOR_PRIMARY = 0x5865f2;
const URL_REGEX =
  /^(https?:\/\/)([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/i;

const DISCORD_CDN_BASE = 'https://cdn.discordapp.com/emojis/';

function resolveEmojiUrl(raw: string): { url: string; animated: boolean } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (URL_REGEX.test(trimmed)) {
    return { url: trimmed, animated: trimmed.endsWith('.gif') };
  }

  const match = trimmed.match(/^<a?:\w+:(\d+)>$/);
  if (!match) return null;
  const [, id] = match;
  const animated = trimmed.startsWith('<a');
  const extension = animated ? 'gif' : 'png';
  return {
    url: `${DISCORD_CDN_BASE}${id}.${extension}?quality=lossless&size=2048`,
    animated,
  };
}

const emojiCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('emoji')
    .setDescription('Display an enlarged version of an emoji or image URL.')
    .addStringOption((option) =>
      option
        .setName('input')
        .setDescription('Custom emoji (e.g. :emoji:) or direct image URL.')
        .setRequired(true),
    )
    .addBooleanOption((option) =>
      option
        .setName('public')
        .setDescription('Show the response to everyone (default: private).')
        .setRequired(false),
    ),
  async execute(interaction) {
    const rawInput = interaction.options.getString('input', true);
    const isPublic = interaction.options.getBoolean('public') ?? false;

    const resolved = resolveEmojiUrl(rawInput);
    if (!resolved) {
      await interaction.reply({
        content:
          'I can only enlarge custom server emojis (like `<:emoji:123>`) or direct image URLs.',
        ephemeral: true,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(COLOR_PRIMARY)
      .setTitle(resolved.animated ? 'Animated emoji' : 'Emoji preview')
      .setDescription(`[Open original image](${resolved.url})`)
      .setImage(resolved.url)
      .setFooter({ text: `Requested by ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      ephemeral: !isPublic,
    });
  },
};

export default emojiCommand;
