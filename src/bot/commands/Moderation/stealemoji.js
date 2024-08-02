const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

const { default: axios } = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('steal-emoji')
  .setDescription('Steal the emoji for your server.')
  .addStringOption(option => option.setName('emoji').setDescription('The emoji you want to steal.').setRequired(true))
  .addStringOption(option => option.setName('name').setDescription('The name you would like to give to the emoji.').setRequired(true)),
  async execute (interaction) {
    await interaction.deferReply();

    if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuildExpressions)) return await interaction.editReply({ content: "You must have the Manage Emojis & Stickers to run this command." });

    let emoji = interaction.options.getString('emoji')?.trim();
    const name = interaction.options.getString('name');

    if(emoji.startsWith("<") && emoji.endsWith(">")) {
      const id = emoji.match(/d{15,}/g)[0];
      const type = await axios.get(`https://cdn.discordapp.com/emojis/${id}.gif`).then(image => {
        if(image) return "gif"
        else return "png"
      }).catch(err => {
        return "png"
      });

      emoji = `https://cdn.discordapp.com/emojis/${id}.${type}?quality=lossless`
    }

    if(emoji.startsWith("<a") && emoji.endsWith(">")) {
      const id = emoji.match(/\d{15,}/g)[0];
      const type = await axios.get(`https://cdn.discordapp.com/emojis/${id}.gif`).then(image => {
        if(image) return "png"
        else return "gif"
      }).catch(err => {
        return "gif"
      });

      emoji = `https://cdn.discordapp.com/emojis/${id}.${type}?quality=lossless`
    }

    if(!emoji.startsWith('http')) {
      return await interaction.editReply({ content: "You can't steal default emojis.", ephemeral: true });
    }

    if(!emoji.startsWith('https')) {
      return await interaction.editReply({ content: "You can't steal default emojis.", ephemeral: true });
    }

    interaction.guild.emojis.create({ attachment: `${emoji}`, name: `${name}` }).then(emoji => {
      const embed = new EmbedBuilder()
      .setColor('Random')
      .setDescription(`Successfully added ${emoji}, with the name **${name}**.`)

      return interaction.editReply({ embeds: [embed] }).catch(err => {
        interaction.editReply({ content: "Your emojis limit is over, delete some emojis and try again!", ephemeral: true });
      });
    });
  }
}
