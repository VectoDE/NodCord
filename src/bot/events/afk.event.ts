import { EmbedBuilder, Events, type GuildMember, type Message } from 'discord.js';

import type { BotEventModule } from '@/bot/types';
import {
  fetchAfkStatus,
  clearAfkStatus,
  getCachedAfkStatus,
  setCacheEntry,
} from '@/bot/services/afk.service';
import logger from '@/services/logger.service';

const COLOR_NOTICE = 0xfacc15;
const COLOR_RETURN = 0x57f287;

function formatDisplayName(member: GuildMember | null): string {
  if (!member) return 'Unknown member';
  return member.displayName ?? member.user.username;
}

function buildReturnEmbed(member: GuildMember): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(COLOR_RETURN)
    .setDescription(`Welcome back, **${member.displayName}**! I removed your AFK status.`)
    .setTimestamp();
}

function buildNoticeEmbed(lines: string[]): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(COLOR_NOTICE)
    .setTitle('AFK Notice')
    .setDescription(lines.join('\n'))
    .setTimestamp();
}

const afkEvent: BotEventModule<'messageCreate'> = {
  name: Events.MessageCreate,
  async execute(_client, message: Message) {
    if (message.author.bot || !message.guild) return;
    if (!message.channel.isTextBased() || message.channel.isDMBased()) return;

    const channel = message.channel;

    const guildId = message.guild.id;
    const authorId = message.author.id;

    try {
      const authorStatus = await fetchAfkStatus(guildId, authorId);
      if (authorStatus) {
        await clearAfkStatus(guildId, authorId);
        const member = await message.guild.members.fetch(authorId).catch(() => null);
        if (member) {
          await channel.send({ embeds: [buildReturnEmbed(member)] });
        }
      }
    } catch (error) {
      logger.warn('[AFK] Failed to clear AFK status on message', { guildId, authorId, error });
    }

    const mentionedUsers = Array.from(new Set(message.mentions.users.map((user) => user.id)));
    if (mentionedUsers.length === 0) return;

    const lines: string[] = [];

    for (const userId of mentionedUsers) {
      try {
        const cached = getCachedAfkStatus(guildId, userId);
        const status = cached === undefined ? await fetchAfkStatus(guildId, userId) : cached;
        if (!status) continue;

        const member = await message.guild.members.fetch(userId).catch(() => null);
        const displayName = formatDisplayName(member);
        const since = Math.floor(new Date(status.setAt).getTime() / 1000);
        lines.push(`• **${displayName}** — ${status.message} (set <t:${since}:R>)`);
        setCacheEntry(guildId, userId, status);
      } catch (error) {
        logger.warn('[AFK] Failed to fetch AFK status for mention', { guildId, userId, error });
      }
    }

    if (lines.length > 0) {
      await message.reply({
        embeds: [buildNoticeEmbed(lines)],
        allowedMentions: { users: [] },
      });
    }
  },
};

export default afkEvent;
