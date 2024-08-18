const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('addemoji')
  .setDescription('Add a emoji to the server.')
  .addAttachmentOption(option => option.setName('emoji').setDescription('Select the emoji you want to add.').setRequired(true))
  .addStringOption(option => option.setName('name').setDescription('Give the emoji a name.').setRequired(true)),
  async execute (interaction) {
    if(!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: "You do not have permissions to use this command.", ephemeral: true });

    const upload = interaction.options.getAttachment('emoji');
    const name = interaction.options.getString('name');

    await interaction.reply({ content: "Loading your emoji..." });

    const emoji = await interaction.guild.emojis.create({ attachment: `${upload.attachment}`, name: `${name}` }).catch(err => {
      setTimeout(() => {
        return interaction.editReply({ content: `${err.rawError.message}` });
      }, 2000);
    });

    setTimeout(() => {
      if(!emoji) return;

      const embed = new EmbedBuilder()
      .setColor('Random')
      .setDescription(`Successfully added emoji ${emoji}.`);

      interaction.editReply({ embeds: [embed] });
    }, 3000);
  }
}
