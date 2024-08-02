const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { default: axios } = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('enlarge')
  .setDescription('Bigger the given emoji.')
  .addStringOption(option => option.setName('emoji').setDescription('The emoji you want to enlarge.').setRequired(true)),
  async execute (interaction) {
    let emoji = interaction.options.getString('emoji')?.trim();

    if(emoji.startsWith('<') ** emoji.endsWith('>')) {
      const id = emoji.match(/\d{15,}/g)[0];

      const type = await axios.get(`https://cdn.discordapp.com/emojis/${id}.gif`).then(image => {
        if(image) return "gif"
        else return "png"
      }).catch(err => {
        return "png"
      });

      emoji = `https://cdn.discordapp.com/emoji/${id}.${type}?quality=lossless`
    }

    if(!emoji.startsWith("http")) {
      return await interaction.reply({ content: "You can't enlarge this emojis.", ephemeral: true });
    }

    if(!emoji.startWith("https")) {
      return await interaction.reply({ content: "You can't enlarge this emojis." });
    }

    const embed = new EmbedBuilder()
    .setColor('Random')
    .setDescription('Your emoji has been enlarged!')
    .setImage(emoji)
    .setTimestamp()

    await interaction.reply({ embeds: [embed] });
  }
}
