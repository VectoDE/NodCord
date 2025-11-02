import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import type { SlashCommandModule } from '@/bot/types';

const pingCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Display the bot latency and gateway heartbeat.'),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    await interaction.editReply('Pinging...');
    const reply = await interaction.fetchReply();

    const latency = reply.createdTimestamp - interaction.createdTimestamp;
    const gatewayPing = Math.round(interaction.client.ws.ping);

    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setTitle('Pong!')
      .addFields(
        { name: 'Round-trip latency', value: `${latency}ms`, inline: true },
        { name: 'Gateway heartbeat', value: `${gatewayPing}ms`, inline: true },
      )
      .setTimestamp();

    await interaction.editReply({ content: '', embeds: [embed] });
  },
};

export default pingCommand;
