const { Events, EmbedBuilder, ButtonStyle, ActionRowBuilder, SlashCommandBuilder, ButtonBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: Events.MessageCreate,
  async execute(message, client, interaction) {
    if(message.author.bot) return;
    if(message.content.startsWith(`<@${process.env.DISCORD_CLIENT_ID}>`))
    {
      const pingEmbed = new EmbedBuilder()
      .setColor('Random')
      .setTitle("Who mentioned me?")
      .setDescription(`Hey there **${message.author.username}** here is some useful information...`)
      .setTimestamp()
      .setThumbnail(client.user.displayAvatarURL())
      .setFooter({ text: `Requested by ${message.author.username}` });

      const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
        .setEmoji("☑️")
        .setLabel("Invite Me")
        .setURL(`https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=${PermissionsBitField.Flags.Administrator}`)
        .setStyle(ButtonStyle.Link),

        new ButtonBuilder()
        .setEmoji("📬")
        .setLabel("Support Server")
        .setURL("https://discord.gg/Up4cjENT7n")
        .setStyle(ButtonStyle.Link)
      );

      return message.reply({ embeds: [pingEmbed], components: [buttons] });
    }
  }
}
