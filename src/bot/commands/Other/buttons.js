const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('buttons')
    .setDescription('Show you all buttons.'),
  async execute(interaction) {
    const button1 = new ButtonBuilder()
      .setCustomId('id-1')
      .setLabel('Primary')
      .setStyle(ButtonStyle.Primary);

    const button2 = new ButtonBuilder()
      .setCustomId('id-2')
      .setLabel('Emoji')
      .setEmoji('🎉')
      .setStyle(ButtonStyle.Secondary);

    const button3 = new ButtonBuilder()
      .setURL('https://youtube.com')
      .setStyle(ButtonStyle.Secondary)
      .setLabel('Link');

    const button4 = new ButtonBuilder()
      .setCustomId('id-4')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('☑️');

    const button5 = new ButtonBuilder()
      .setCustomId('id-5')
      .setStyle(ButtonStyle.Success)
      .setDisabled(true)
      .setLabel('Disabled');

    await interaction.reply({
      components: [
        new ActionRowBuilder().addComponents(
          button1,
          button2,
          button3,
          button4,
          button5
        ),
      ],
    });
  },
};
