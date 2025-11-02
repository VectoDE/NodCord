import {
  ChannelType,
  PermissionFlagsBits,
  SlashCommandBuilder,
  type Collection,
  type Message,
  type Sticker,
  type TextChannel,
} from 'discord.js';

import type { SlashCommandModule } from '@/bot/types';

type GuildSticker = Sticker & { url: string };

const stealStickerCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('steal-sticker')
    .setDescription('Import a sticker from another server.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions),
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
        content: 'You need the Manage Emojis & Stickers permission to use this command.',
        ephemeral: true,
      });
      return;
    }

    const channel = interaction.channel;
    if (!channel || channel.type !== ChannelType.GuildText) {
      await interaction.reply({
        content: 'Please run this command inside a text channel.',
        ephemeral: true,
      });
      return;
    }

    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply({
        content: 'I could not determine the guild context for this command.',
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({
      content: 'Send the sticker you want to import within 15 seconds.',
      ephemeral: true,
    });

    const textChannel = channel as TextChannel;

    const collector = textChannel.createMessageCollector({
      filter: (message: Message) => message.author.id === interaction.user.id,
      time: 15_000,
      max: 1,
    });

    collector.once('collect', async (message: Message) => {
      const stickers: Collection<string, Sticker> = message.stickers;
      const sticker = stickers.first() as GuildSticker | undefined;

      if (!sticker) {
        await interaction.editReply({
          content: 'That message did not contain a sticker. Cancelled.',
        });
        return;
      }

      if (sticker.url.endsWith('.json')) {
        await interaction.editReply({ content: 'That sticker cannot be imported.' });
        return;
      }

      const botMember = guild.members.me;
      if (!botMember?.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
        await interaction.editReply({
          content: 'I am missing the Manage Emojis & Stickers permission.',
        });
        return;
      }

      try {
        const created = await guild.stickers.create({
          name: sticker.name ?? `imported-${Date.now()}`,
          file: sticker.url,
          description: sticker.description ?? '',
          tags: sticker.tags ?? 'sticker',
        });

        await interaction.editReply({ content: `Sticker **${created.name}** has been added.` });
      } catch (error) {
        await interaction.editReply({
          content:
            'I could not add that sticker. The server may be at capacity or the sticker file is too large.',
        });
      }
    });

    collector.once('end', async (_collected, reason) => {
      if (reason === 'time') {
        await interaction.editReply({ content: 'Timed out waiting for a sticker.' });
      }
    });
  },
};

export default stealStickerCommand;
