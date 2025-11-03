import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import type { Collection, Invite } from 'discord.js';
import type { SlashCommandModule } from '@/bot/types';

const invitesCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('checkinvites')
    .setDescription('Check how many invites a server member has created.')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('Member whose invites you want to inspect.')
        .setRequired(true),
    ),
  async execute(interaction) {
    if (!interaction.inGuild() || !interaction.guild) {
      await interaction.reply({
        content: 'This command can only be used inside a server.',
        ephemeral: true,
      });
      return;
    }

    const targetUser = interaction.options.getUser('user', true);

    let invites: Collection<string, Invite>;
    try {
      invites = await interaction.guild.invites.fetch();
    } catch {
      await interaction.reply({
        content:
          'I could not fetch the invite list. Make sure I have the Manage Server permission.',
        ephemeral: true,
      });
      return;
    }

    const userInviteTotal = invites
      .filter((invite) => invite.inviter?.id === targetUser.id)
      .reduce((total, invite) => total + (invite.uses ?? 0), 0);

    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setDescription(
        `**${targetUser.tag}** currently has **${userInviteTotal}** invite${userInviteTotal === 1 ? '' : 's'}.`,
      );

    await interaction.reply({ embeds: [embed] });
  },
};

export default invitesCommand;
