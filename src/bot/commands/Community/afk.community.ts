const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const afkSchema = require('../../../models/afkModel');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('afk')
  .setDescription('AFK within the server.')
  .addSubcommand(command => command.setName('set').setDescription('Go afk.').addStringOption(option => option.setName('message').setDescription('The reason for afk.').setRequired(false))),
  async execute(interaction) {
    const { options } = interaction;
    const sub = options.getSubcommand();

    const Data = await afkSchema.findOne({ Guild: interaction.guild.id, User: interaction.user.id });

    switch(sub) {
      case 'set':
        if(Data)
          return await interaction.reply({ content: 'You are already afk.', ephemeral: true });
        else {
          const message = options.getString('message') || "I'm AFK";
          await afkSchema.create({ Guild: interaction.guild.id, User: interaction.user.id, Message: message })

          const embed = new EmbedBuilder()
          .setColor('Random')
          .setDescription(`You are now AFK within this server, reason: **${message}**.`)

          await interaction.reply({ embeds: [embed] });
        }
    }
  }
}
