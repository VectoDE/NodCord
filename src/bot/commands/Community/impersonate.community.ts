import { SlashCommandBuilder, type TextChannel } from 'discord.js';

import type { SlashCommandModule } from '@/bot/types';

const impersonateCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('impersonate')
    .setDescription('Send a message using a temporary webhook.')
    .addUserOption((option) =>
      option.setName('user').setDescription('The user you want to impersonate.').setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('message')
        .setDescription('The message to send as the impersonated user.')
        .setRequired(true),
    ),
  async execute(interaction) {
    if (!interaction.inGuild()) {
      await interaction.reply({
        content: 'This command can only be used in a server.',
        ephemeral: true,
      });
      return;
    }

    const channel = interaction.channel;
    if (!channel || !('createWebhook' in channel)) {
      await interaction.reply({
        content: 'I can only impersonate users in text channels.',
        ephemeral: true,
      });
      return;
    }

    const targetUser = interaction.options.getUser('user', true);
    const messageContent = interaction.options.getString('message', true);

    try {
      const webhook = await (channel as TextChannel).createWebhook({
        name: targetUser.username,
        avatar: targetUser.displayAvatarURL({ forceStatic: false }),
      });

      await webhook.send({ content: messageContent.slice(0, 2000) });
      setTimeout(() => webhook.delete().catch(() => undefined), 5_000);

      await interaction.reply({
        content: `${targetUser} has been impersonated below.`,
        ephemeral: true,
      });
    } catch (error) {
      await interaction.reply({
        content: 'I was unable to create a webhook in this channel.',
        ephemeral: true,
      });
    }
  },
};

export default impersonateCommand;
