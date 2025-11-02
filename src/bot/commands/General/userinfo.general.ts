import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import type { GuildMember } from 'discord.js';
import type { SlashCommandModule } from '@/bot/types';

function resolveRoles(member: GuildMember): string {
  const roles = member.roles.cache.filter((role) => role.id !== member.guild.id);
  if (roles.size === 0) {
    return 'No roles';
  }

  return roles.map((role) => role.toString()).join(' ');
}

const userInfoCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Display information about a server member.')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('Select a user to inspect. Defaults to yourself.')
        .setRequired(false),
    ),
  async execute(interaction) {
    if (!interaction.inGuild() || !interaction.guild) {
      await interaction.reply({
        content: 'This command can only be used inside a server.',
        ephemeral: true,
      });
      return;
    }

    const user = interaction.options.getUser('user') ?? interaction.user;
    let member: GuildMember;

    try {
      member = await interaction.guild.members.fetch(user.id);
    } catch {
      await interaction.reply({
        content: 'I could not find that member in this server.',
        ephemeral: true,
      });
      return;
    }

    const createdTimestamp = Math.floor(user.createdTimestamp / 1000);
    const joinedTimestamp = member.joinedTimestamp
      ? Math.floor(member.joinedTimestamp / 1000)
      : null;

    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: 'User', value: `${user}`, inline: true },
        { name: 'Roles', value: resolveRoles(member), inline: true },
        { name: 'Joined Discord', value: `<t:${createdTimestamp}:R>`, inline: false },
        {
          name: 'Joined Server',
          value: joinedTimestamp ? `<t:${joinedTimestamp}:R>` : 'Unknown',
          inline: false,
        },
      )
      .setFooter({ text: `User ID: ${user.id}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

export default userInfoCommand;
