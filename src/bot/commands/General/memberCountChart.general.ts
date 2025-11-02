import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import QuickChart from 'quickchart-js';

import type { SlashCommandModule } from '@/bot/types';

const memberCountChartCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('membercount-chart')
    .setDescription('Visualise the server member counts in a quick chart.'),
  async execute(interaction) {
    if (!interaction.inGuild() || !interaction.guild) {
      await interaction.reply({
        content: 'This command can only be used inside a server.',
        ephemeral: true,
      });
      return;
    }

    const guild = interaction.guild;
    await guild.members.fetch();

    const totalMembers = guild.memberCount;
    const botMembers = guild.members.cache.filter((member) => member.user.bot).size;
    const humanMembers = totalMembers - botMembers;

    const chart = new QuickChart()
      .setConfig({
        type: 'bar',
        data: {
          labels: ['Total', 'Humans', 'Bots'],
          datasets: [
            {
              label: 'Members',
              backgroundColor: ['#36a2eb', '#4bc0c0', '#ff6384'],
              data: [totalMembers, humanMembers, botMembers],
            },
          ],
        },
        options: {
          plugins: {
            legend: { display: false },
          },
          scales: {
            y: { beginAtZero: true, ticks: { precision: 0 } },
          },
        },
      })
      .setWidth(500)
      .setHeight(300)
      .setBackgroundColor('#151515');

    let chartUrl: string;
    try {
      chartUrl = await chart.getShortUrl();
    } catch {
      chartUrl = chart.getUrl();
    }

    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setTitle(`${guild.name} Member Count`)
      .setDescription(
        `Total: **${totalMembers}**\nHumans: **${humanMembers}**\nBots: **${botMembers}**`,
      )
      .setImage(chartUrl)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

export default memberCountChartCommand;
