import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  PermissionsBitField,
  type PermissionResolvable,
} from 'discord.js';

import type { PrefixCommandContext, PrefixCommandModule } from '@/bot/types';

const EMBED_COLOR = 0x5865f2;
const ERROR_COLOR = 0xff4d4d;
const INFO_COLOR = 0x2b2d31;
const PAGE_SIZE = 25;

function formatPermissionName(raw: string): string {
  return raw
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatPermissionResolvable(perm: PermissionResolvable): string {
  const resolved = PermissionsBitField.resolve(perm);
  const entry = Object.entries(PermissionsBitField.Flags).find(([, value]) => value === resolved);
  const raw = entry?.[0] ?? perm.toString();
  return formatPermissionName(raw);
}

function uniquePrefixModules(ctx: PrefixCommandContext): PrefixCommandModule[] {
  return Array.from(new Set(ctx.client.prefix.values())).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

function chunkModules<T>(items: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

function buildErrorEmbed(message: string): EmbedBuilder {
  return new EmbedBuilder().setColor(ERROR_COLOR).setDescription(message);
}

function buildInfoEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder().setColor(INFO_COLOR).setTitle(title).setDescription(description);
}

function buildListEmbed(
  modules: readonly PrefixCommandModule[],
  prefix: string,
  pageIndex: number,
  totalPages: number,
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setTitle('Prefix Commands')
    .setDescription(`Use ${'`'}${prefix}help <command>${'`'} for detailed information.`)
    .setFooter({ text: `Page ${pageIndex + 1} of ${totalPages}` });

  modules.forEach((mod) => {
    const aliases = mod.aliases?.length
      ? `**Aliases:** ${mod.aliases.map((alias) => `${prefix}${alias}`).join(', ')}`
      : '**Aliases:** none';
    embed.addFields({
      name: `${prefix}${mod.name}`,
      value: `${mod.description ?? 'No description provided.'}\\n${aliases}`,
    });
  });

  return embed;
}

function buildPaginatorRow(current: number, total: number): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('help_prev')
      .setEmoji('◀️')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(current === 0),
    new ButtonBuilder()
      .setCustomId('help_stop')
      .setLabel('Close')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('help_next')
      .setEmoji('▶️')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(current >= total - 1),
  );
}

async function handleHelpList(ctx: PrefixCommandContext): Promise<void> {
  const { message, prefix } = ctx;
  const modules = uniquePrefixModules(ctx);

  if (modules.length === 0) {
    await message.reply({
      embeds: [buildInfoEmbed('No Commands', 'There are currently no prefix commands registered.')],
    });
    return;
  }

  const pages = chunkModules(modules, PAGE_SIZE);
  let pageIndex = 0;

  const reply = await message.reply({
    embeds: [buildListEmbed(pages[pageIndex]!, prefix, pageIndex, pages.length)],
    components: pages.length > 1 ? [buildPaginatorRow(pageIndex, pages.length)] : [],
  });

  if (pages.length <= 1) return;

  const collector = reply.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 120_000,
    filter: (interaction) => interaction.user.id === message.author.id,
  });

  collector.on('collect', async (interaction) => {
    if (interaction.customId === 'help_prev') {
      pageIndex = Math.max(pageIndex - 1, 0);
    } else if (interaction.customId === 'help_next') {
      pageIndex = Math.min(pageIndex + 1, pages.length - 1);
    } else if (interaction.customId === 'help_stop') {
      collector.stop('stopped');
      await interaction.update({ components: [] });
      return;
    }

    await interaction.update({
      embeds: [buildListEmbed(pages[pageIndex]!, prefix, pageIndex, pages.length)],
      components: [buildPaginatorRow(pageIndex, pages.length)],
    });
  });

  collector.on('end', async (_, reason) => {
    if (reason === 'messageDelete') return;
    if (reply.editable) {
      await reply.edit({ components: [] });
    }
  });
}

function buildCommandDetailsEmbed(
  ctx: PrefixCommandContext,
  command: PrefixCommandModule,
): EmbedBuilder {
  const { prefix } = ctx;
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setTitle(`Command: ${prefix}${command.name}`)
    .setDescription(command.description ?? 'No description provided.');

  if (command.usage) {
    embed.addFields({ name: 'Usage', value: `\`${prefix}${command.usage}\`` });
  }

  if (command.aliases?.length) {
    embed.addFields({ name: 'Aliases', value: command.aliases.map((alias) => `${prefix}${alias}`).join(', ') });
  }

  if (command.requiredPermissions?.length) {
    embed.addFields({
      name: 'Required Permissions',
      value: command.requiredPermissions.map((perm) => formatPermissionResolvable(perm)).join(', '),
    });
  }

  if (command.subcommands?.length) {
    const details = command.subcommands
      .map((sub) => {
        const aliasText = sub.aliases?.length
          ? `\nAliases: ${sub.aliases.map((alias) => `${prefix}${command.name} ${alias}`).join(', ')}`
          : '';
        const usage = sub.usage ? `\nUsage: \`${prefix}${sub.usage}\`` : '';
        return `• **${sub.name}** — ${sub.description ?? 'No description provided.'}${aliasText}${usage}`;
      })
      .join('\n\n');

    embed.addFields({ name: 'Subcommands', value: details });
  }

  if (command.subcommandGroups?.length) {
    command.subcommandGroups.forEach((group) => {
      const entries = group.subcommands
        .map((sub) => {
          const aliasText = sub.aliases?.length
            ? `\nAliases: ${sub.aliases
                .map((alias) => `${prefix}${command.name} ${group.name} ${alias}`)
                .join(', ')}`
            : '';
          const usage = sub.usage ? `\nUsage: \`${prefix}${sub.usage}\`` : '';
          return `• **${sub.name}** — ${sub.description ?? 'No description provided.'}${aliasText}${usage}`;
        })
        .join('\n\n');

      embed.addFields({
        name: `Group: ${group.name}`,
        value: `${group.description ?? 'No description provided.'}\n\n${entries}`,
      });
    });
  }

  return embed;
}

async function handleHelpDetail(ctx: PrefixCommandContext): Promise<void> {
  const { message, args } = ctx;
  const query = args[0]?.toLowerCase();
  if (!query) {
    await handleHelpList(ctx);
    return;
  }

  const command = ctx.client.prefix.get(query);
  if (!command) {
    await message.reply({
      embeds: [buildErrorEmbed(`❓ I couldn't find a prefix command named \`${query}\`.`)],
    });
    return;
  }

  const embed = buildCommandDetailsEmbed(ctx, command);
  await message.reply({ embeds: [embed] });
}

const helpCommand: PrefixCommandModule = {
  name: 'help',
  description: 'Display information about prefix commands.',
  usage: 'help [command]',
  default: handleHelpDetail,
};

export default helpCommand;
