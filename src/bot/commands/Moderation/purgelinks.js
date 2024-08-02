const { SlashCommandBuilder, ChannelType ,EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('purge-links')
  .setDescription('This purges channel links messages.')
  .addChannelOption(option => option.setName('amount').setDescription('The channel you want to purge links from..').addChannelTypes(ChannelType.GuildText).setRequired(true)),
  async execute (interaction) {
    if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return interaction.reply({ content: "You don't have permissions to purges links messages.", ephemeral: true });

    const { guild, options } = interaction;

    const channel = options.getChannel('channel') || interaction.channel;

    const messages = await channel.messages.fetch();

    await interaction.deferReply({ ephemeral: true });

    let count = [];
    let response;

    await messages.forEach(async me => {
      if(me.content.includes('https://') || me.content.includes('http://') || me.content.includes('discord.gg/')) {
        await me.delete().catch(err => {});
        count++;
        response = true;

        const embed = new EmbedBuilder()
        .setColor('Random')
        .setDescription(`Successfully deleted **${count}** messages containing **links** from this channel.`);

        await interaction.editReply({ content: "", embeds: [embed] });
      } else {
        return;
      }
    });

    if(response === true) {
      return;
    } else {
      await interaction.editReply({ content: "You have **0** links in this channel.", ephemeral: true });
    }
  }
}
