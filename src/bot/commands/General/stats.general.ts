import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionsBitField,
  SlashCommandBuilder,
} from 'discord.js';

import type { SlashCommandModule } from '@/bot/types';

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  const segments = [
    days ? `${days} day${days === 1 ? '' : 's'}` : null,
    hours ? `${hours} hour${hours === 1 ? '' : 's'}` : null,
    minutes ? `${minutes} minute${minutes === 1 ? '' : 's'}` : null,
    `${seconds} second${seconds === 1 ? '' : 's'}`,
  ].filter(Boolean);

  return segments.join(', ');
}

const statsCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Display current bot statistics.'),
  async execute(interaction, client) {
    const clientUser = client.user;
    if (!clientUser) {
      await interaction.reply({
        content: 'The client user is not ready yet. Please try again shortly.',
        ephemeral: true,
      });
      return;
    }

    const totalMembers = client.guilds.cache.reduce(
      (accumulator, guild) => accumulator + guild.memberCount,
      0,
    );
    const uptimeMilliseconds = client.uptime ?? 0;

    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel('Support Server')
        .setStyle(ButtonStyle.Link)
        .setURL('https://discord.gg/Up4cjENT7n'),
      new ButtonBuilder()
        .setLabel('Invite Me')
        .setStyle(ButtonStyle.Link)
        .setURL(
          `https://discord.com/oauth2/authorize?client_id=${clientUser.id}&scope=bot%20applications.commands&permissions=${PermissionsBitField.Flags.Administrator.toString()}`,
        ),
    );

    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setAuthor({ name: clientUser.username, iconURL: clientUser.displayAvatarURL() })
      .setThumbnail(clientUser.displayAvatarURL())
      .addFields(
        { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
        { name: 'Total Members', value: `${totalMembers}`, inline: true },
        { name: 'Gateway Ping', value: `${Math.round(client.ws.ping)}ms`, inline: true },
        {
          name: 'Uptime',
          value: `\`\`\`${formatDuration(uptimeMilliseconds)}\`\`\``,
          inline: false,
        },
      )
      .setFooter({ text: `Bot ID: ${clientUser.id}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], components: [buttons] });
  },
};

export default statsCommand;
