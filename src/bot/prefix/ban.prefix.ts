import {
  EmbedBuilder,
  PermissionsBitField,
  type GuildBan,
  type GuildMember,
  type GuildTextBasedChannel,
} from 'discord.js';

import type { PrefixCommandContext, PrefixCommandModule } from '@/bot/types';

const DEFAULT_REASON = 'No reason provided.';
const MAX_BANS_PER_PAGE = 10;

function sanitizeId(input: string): string {
  return input.replace(/[<@!>#]/g, '');
}

async function resolveTargetMember(
  ctx: PrefixCommandContext,
  identifier?: string,
): Promise<GuildMember | null> {
  const { message } = ctx;
  const guild = message.guild;
  if (!guild) return null;

  const mentioned = message.mentions.members?.first();
  if (mentioned) return mentioned;

  if (!identifier) return null;

  const cleaned = sanitizeId(identifier);

  try {
    return await guild.members.fetch(cleaned);
  } catch {
    return null;
  }
}

async function confirmBanAction(
  channel: GuildTextBasedChannel,
  target: GuildMember,
  reason: string,
  moderator: GuildMember | null,
  type: 'ban' | 'unban',
): Promise<void> {
  const author = {
    name: moderator ? `${moderator.displayName} (${moderator.user.tag})` : 'Moderator',
  } as {
    name: string;
    iconURL?: string;
  };

  if (moderator) {
    author.iconURL = moderator.displayAvatarURL();
  }

  const embed = new EmbedBuilder()
    .setColor(type === 'ban' ? 0xff4d4d : 0x57f287)
    .setAuthor(author)
    .setDescription(
      type === 'ban'
        ? `🔨 **${target.user.tag}** was banned.`
        : `✅ **${target.user.tag}** was unbanned.`,
    )
    .addFields({ name: 'Reason', value: reason })
    .setTimestamp(Date.now());

  await channel.send({ embeds: [embed] });
}

async function handleBanAdd(ctx: PrefixCommandContext): Promise<void> {
  const { message, args } = ctx;
  const guild = message.guild;
  if (!guild) return;

  const responseChannel = message.channel as GuildTextBasedChannel;
  const member = await resolveTargetMember(ctx, args[0]);

  if (!member) {
    await responseChannel.send('❌ Please specify a valid member to ban.');
    return;
  }

  if (member.id === message.author.id) {
    await responseChannel.send("❌ You cannot ban yourself.");
    return;
  }

  if (!member.bannable) {
    await responseChannel.send('❌ I am unable to ban that member due to role hierarchy.');
    return;
  }

  const reason = args.slice(1).join(' ') || DEFAULT_REASON;

  const dmEmbed = new EmbedBuilder()
    .setColor(0xff4d4d)
    .setDescription(
      `You have been banned from **${guild.name}**.\nReason: ${reason}\nModerator: ${message.author.tag}`,
    )
    .setTimestamp();

  await member
    .send({ embeds: [dmEmbed] })
    .catch(() => undefined); // Ignore DM errors

  try {
    await guild.members.ban(member, { reason });
  } catch {
    await responseChannel.send('⚠️ I encountered an error while attempting to ban that member.');
    return;
  }

  await confirmBanAction(responseChannel, member, reason, message.member, 'ban');
}

async function handleBanRemove(ctx: PrefixCommandContext): Promise<void> {
  const { message, args } = ctx;
  const guild = message.guild;
  if (!guild) return;

  if (args.length === 0) {
    await message.reply('❌ Please provide the user ID of the member you want to unban.');
    return;
  }

  const userId = sanitizeId(args[0]!);
  const reason = args.slice(1).join(' ') || DEFAULT_REASON;

  let existingBan: GuildBan;
  try {
    existingBan = await guild.bans.fetch(userId);
  } catch {
    await message.reply('⚠️ I could not find a ban matching that user ID.');
    return;
  }

  try {
    await guild.bans.remove(existingBan.user, reason);
  } catch {
    await message.reply('⚠️ I was unable to remove that ban. Please check my permissions.');
    return;
  }

  const dummyMember = {
    user: existingBan.user,
    id: existingBan.user.id,
    displayName: existingBan.user.username,
  } as unknown as GuildMember;

  await confirmBanAction(
    message.channel as GuildTextBasedChannel,
    dummyMember,
    reason,
    message.member,
    'unban',
  );
}

async function handleBanList(ctx: PrefixCommandContext): Promise<void> {
  const { message, args } = ctx;
  const guild = message.guild;
  if (!guild) return;

  const page = Number.parseInt(args[0] ?? '1', 10);
  const pageIndex = Number.isNaN(page) || page < 1 ? 0 : page - 1;

  const bans = await guild.bans.fetch();
  if (bans.size === 0) {
    await message.reply('👍 There are currently no banned users.');
    return;
  }

  const start = pageIndex * MAX_BANS_PER_PAGE;
  const slice = Array.from(bans.values()).slice(start, start + MAX_BANS_PER_PAGE);

  if (slice.length === 0) {
    await message.reply('⚠️ That page does not exist.');
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(0xffb347)
    .setTitle(`Banned members — Page ${pageIndex + 1}`)
    .setFooter({ text: `Total bans: ${bans.size}` })
    .setTimestamp();

  slice.forEach((ban, idx) => {
    embed.addFields({
      name: `${start + idx + 1}. ${ban.user.tag}`,
      value: `ID: ${ban.user.id}\nReason: ${ban.reason ?? DEFAULT_REASON}`,
    });
  });

  await message.reply({ embeds: [embed] });
}

const banCommand: PrefixCommandModule = {
  name: 'ban',
  description: 'Manage guild bans (add, remove, list).',
  aliases: ['hammer'],
  usage: 'ban <add|remove|list> ...',
  requiredPermissions: [PermissionsBitField.Flags.BanMembers],
  default: handleBanAdd,
  subcommands: [
    {
      name: 'add',
      aliases: ['issue'],
      description: 'Ban a member from the server.',
      usage: 'ban add <member> [reason]',
      handler: handleBanAdd,
    },
    {
      name: 'remove',
      aliases: ['revoke', 'unban'],
      description: 'Unban a user by their ID.',
      usage: 'ban remove <userId> [reason]',
      handler: handleBanRemove,
    },
    {
      name: 'list',
      description: 'List recently banned users.',
      usage: 'ban list [page]',
      handler: handleBanList,
    },
  ],
};

export default banCommand;
export { handleBanRemove };
