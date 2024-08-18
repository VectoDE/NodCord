require('dotenv').config();
const { SlashCommandBuilder, EmbedBuilder, time } = require('discord.js');

let timeout = [];

module.exports = {
  data: new SlashCommandBuilder()
  .setName('report')
  .setDescription('Report the bugs & issues of our bot.')
  .addStringOption(option => option.setName('message').setDescription('Please write the issue you want to report.').setRequired(true)),
  async execute(interaction, client) {
    if(timeout.includes(interaction.user.id)) return await interaction.reply({ content: "You are on a cooldown, try again in 1 minute.", ephemeral: true });

    const { options, guild } = interaction;
    const guildId = guild.id;
    const message = options.getString('message');
    const user = interaction.user;
    const tag = user.tag;
    const name = guild;
    const channel = await client.channels.cache.get(process.env.REPORT_CHANNEL);

    const embed = new EmbedBuilder()
    .setColor('Random')
    .setTitle('Bot Reports')
    .addFields({ name: 'Server Name', value: `${name}` })
    .addFields({ name: 'Server ID', value: `${guildId}` })
    .addFields({ name: 'Send By', value: `${tag} | ||${user.id}||` })
    .setDescription(`Report Message: **${message}**`);

    const DMembed = new EmbedBuilder()
    .setColor('Random')
    .setDescription('Your report is submitted!');

    const embed2 = new EmbedBuilder()
    .setColor('Random')
    .setDescription('Successfully submitted your report!');

    await channel.send({ embeds: [embed] })
    await interaction.reply({ embeds: [embed2] });
    await user.send({ embeds: [DMembed] }).catch(err => {
      return;
    });

    timeout.push(interaction.user.id);
    setTimeout(() => {
      timeout.shift();
    }, 60000)
  }
}
