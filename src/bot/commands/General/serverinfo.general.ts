import { EmbedBuilder, GuildVerificationLevel, SlashCommandBuilder } from 'discord.js';

import type { SlashCommandModule } from '@/bot/types';

function formatVerificationLevel(level: GuildVerificationLevel): string {
  switch (level) {
    case GuildVerificationLevel.VeryHigh:
      return 'Very High';
    case GuildVerificationLevel.High:
      return 'High';
    case GuildVerificationLevel.Medium:
      return 'Medium';
    case GuildVerificationLevel.Low:
      return 'Low';
    default:
      return 'None';
  }
}

const serverInfoCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Display key information about this server.'),
  async execute(interaction) {
    if (!interaction.inGuild() || !interaction.guild) {
      await interaction.reply({
        content: 'This command can only be used inside a server.',
        ephemeral: true,
      });
      return;
    }

    const guild = interaction.guild;
    const iconUrl = guild.iconURL();

    const owner = await guild.fetchOwner();
    const createdTimestamp = Math.floor(guild.createdTimestamp / 1000);
    const verificationLevel = formatVerificationLevel(guild.verificationLevel);
    const boostCount = guild.premiumSubscriptionCount ?? 0;

    const embed = new EmbedBuilder().setColor('Blurple').setTitle(guild.name).setTimestamp();

    if (iconUrl) {
      embed.setThumbnail(iconUrl);
      embed.setAuthor({ name: guild.name, iconURL: iconUrl });
    } else {
      embed.setAuthor({ name: guild.name });
    }

    embed.addFields(
      { name: 'Server ID', value: `\`${guild.id}\`` },
      { name: 'Owner', value: `${owner.user.tag} (\`${owner.id}\`)` },
      { name: 'Members', value: `${guild.memberCount}`, inline: true },
      { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
      { name: 'Emojis', value: `${guild.emojis.cache.size}`, inline: true },
      { name: 'Verification', value: verificationLevel, inline: true },
      { name: 'Boosts', value: `${boostCount}`, inline: true },
      { name: 'Created', value: `<t:${createdTimestamp}:R>` },
    );

    await interaction.reply({ embeds: [embed] });
  },
};

export default serverInfoCommand;
