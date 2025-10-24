const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

function parseDuration(duration) {
  const regex = /(\d+)([smhd])/;
  const matches = duration.match(regex);

  if(!matches) return null;

  const [, value, unit] = matches;

  switch(unit) {
    case 's':
      return parseInt(value);
    case 'm':
      return parseInt(value) * 60;
    case 'h':
      return parseInt(value) * 3600;
    case 'd':
      return parseInt(value) * 86400;
    default:
      return null;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
  .setName('timeout')
  .setDescription('Set a timeout for a user.')
  .addUserOption(option => option.setName('user').setDescription('Select the user.').setRequired(true))
  .addStringOption(option => option.setName('duration').setDescription('Set the duration of the timeout in seconds, minutes (m), or days (d).'))
  .addStringOption(option => option.setName('reason').setDescription('Provide a reason for the timeout.').setRequired(false)),
  async execute (interaction) {
    const user = interaction.options.getUser('user');
    const durationInput = interaction.options.getString('duration');
    const duration = parseDuration(durationInput);
    const timeMember = await interaction.guild.members.fetch(user.id);
    const reason = interaction.options.getString('reason') || "No reason provided.";

    if(!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: "You do not have permissions to use this command.", ephemeral: true });
    }

    if(!duration) {
      return interaction.reply({ content: "Invalid duration format.", ephemeral: true });
    }

    await timeMember.timeout(duration * 1000, reason);
    const embed = new EmbedBuilder()
    .setColor('Random')
    .setDescription(`Successfully timeout **${user.tag}** | ${reason}`);

    const dmEmbed = new EmbedBuilder()
    .setColor('Random')
    .setDescription(`You have been timeout in ${interaction.guild.name} | ${reason}`);

    await timeMember.send({ embeds: [dmEmbed] }).catch(err => {
      return;
    });

    await interaction.reply({ embeds: [embed] });
  }
}
