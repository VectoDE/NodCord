import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

import prisma from '@/services/prisma.service';

import type { SlashCommandModule } from '@/bot/types';

interface AutoResponseEntry {
  trigger: string;
  response: string;
}

async function ensureAutoresponder(guildId: string) {
  return prisma.autoresponder.upsert({
    where: { guildId },
    update: {},
    create: { guildId },
  });
}

async function syncAutoresponderSnapshot(guildId: string, autoresponderId: string) {
  const entries = await prisma.autoResponderEntry.findMany({
    where: { autoresponderId },
    select: { trigger: true, response: true },
    orderBy: { createdAt: 'asc' },
  });

  await prisma.autoresponder.update({
    where: { id: autoresponderId },
    data: { autoresponses: entries as unknown as AutoResponseEntry[] },
  });

  return entries;
}

const autoResponderCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('autoresponder')
    .setDescription('Manage automatic responses for common triggers.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((sub) =>
      sub
        .setName('add')
        .setDescription('Add an auto-response trigger.')
        .addStringOption((option) =>
          option
            .setName('trigger')
            .setDescription('What should trigger the response?')
            .setRequired(true)
            .setMaxLength(100),
        )
        .addStringOption((option) =>
          option
            .setName('response')
            .setDescription('What should the bot reply with?')
            .setRequired(true)
            .setMaxLength(1_000),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName('remove')
        .setDescription('Remove an existing auto-response by trigger.')
        .addStringOption((option) =>
          option
            .setName('trigger')
            .setDescription('The trigger you previously configured.')
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) => sub.setName('list').setDescription('List configured auto-responses.'))
    .addSubcommand((sub) => sub.setName('remove-all').setDescription('Delete all auto-responses.')),
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
        content: 'You do not have permission to manage autoresponders.',
        ephemeral: true,
      });
      return;
    }

    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    const autoresponder = await ensureAutoresponder(guildId);

    switch (subcommand) {
      case 'add': {
        const trigger = interaction.options.getString('trigger', true).trim().toLowerCase();
        const response = interaction.options.getString('response', true).trim();

        if (trigger.length === 0 || response.length === 0) {
          await interaction.reply({
            content: 'Trigger and response cannot be empty.',
            ephemeral: true,
          });
          return;
        }

        const existing = await prisma.autoResponderEntry.findFirst({
          where: {
            autoresponderId: autoresponder.id,
            trigger,
          },
        });

        if (existing) {
          await interaction.reply({
            content: 'That trigger is already configured.',
            ephemeral: true,
          });
          return;
        }

        await prisma.autoResponderEntry.create({
          data: {
            autoresponderId: autoresponder.id,
            trigger,
            response,
          },
        });

        await syncAutoresponderSnapshot(guildId, autoresponder.id);

        const embed = new EmbedBuilder()
          .setColor('Blurple')
          .setTitle('Auto-response Added')
          .addFields(
            { name: 'Trigger', value: `\`${trigger}\`` },
            { name: 'Response', value: response.slice(0, 1024) },
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        break;
      }
      case 'remove': {
        const trigger = interaction.options.getString('trigger', true).trim().toLowerCase();

        const existing = await prisma.autoResponderEntry.findFirst({
          where: { autoresponderId: autoresponder.id, trigger },
        });

        if (!existing) {
          await interaction.reply({
            content: 'I could not find an auto-response with that trigger.',
            ephemeral: true,
          });
          return;
        }

        await prisma.autoResponderEntry.delete({ where: { id: existing.id } });
        await syncAutoresponderSnapshot(guildId, autoresponder.id);

        await interaction.reply({
          content: `Removed the auto-response for trigger \`${trigger}\`.`,
          ephemeral: true,
        });
        break;
      }
      case 'list': {
        const entries = await prisma.autoResponderEntry.findMany({
          where: { autoresponderId: autoresponder.id },
          orderBy: { createdAt: 'asc' },
        });

        if (entries.length === 0) {
          await interaction.reply({
            content: 'No auto-responses have been configured yet.',
            ephemeral: true,
          });
          return;
        }

        const embed = new EmbedBuilder()
          .setColor('Blurple')
          .setTitle('Configured Auto-responses')
          .setTimestamp();

        for (const [index, entry] of entries.entries()) {
          embed.addFields({
            name: `#${index + 1} — ${entry.trigger}`,
            value: entry.response.slice(0, 1024),
          });
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
        break;
      }
      case 'remove-all': {
        await prisma.autoResponderEntry.deleteMany({
          where: { autoresponderId: autoresponder.id },
        });
        await syncAutoresponderSnapshot(guildId, autoresponder.id);

        await interaction.reply({
          content: 'All auto-responses have been removed.',
          ephemeral: true,
        });
        break;
      }
    }
  },
};

export default autoResponderCommand;
