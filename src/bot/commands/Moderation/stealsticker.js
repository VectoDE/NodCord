const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('steal-sticker')
  .setDescription('Steal sticker for your server.'),
  async execute (interaction) {
    if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuildExpressions)) return await interaction.reply({ content: "You don't have permissions to use this command." });

    await interaction.reply(`Waiting for your sticker...`);
    const filter = (m) => m.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({ filter: filter, time: 15000, max: 1 });

    collector.on('collect', async m => {
      const sticker = m.stickers.first();
      const { guild } = interaction;

      if(m.stickers.size == 0) return await interaction.editReply("This is not a sticker.");

      if(sticker.url.endsWith('.json'))
        return await interaction.editReply("This is not a valid sticker file.");

      if(!guild.members.me.permissions.has(PermissionsBitField.Flags.ManageGuildExpressions)) return await interaction.reply("I do not have permissions to add stickers to the server.")
      try {
        const newSticker = await guild.stickers.create({
          name: sticker.name,
          description: sticker.description || "",
          tags: sticker.tags,
          file: sticker.url
        })

        await interaction.editReply(`The sticker with the name **${newSticker.name}** has been added.`)
      } catch(err) {
        console.log(err)
        await interaction.editReply(`Your server at max sticker capacity.`)
      }
    });

    collector.on('end', async reason => {
      if(reason === "time") return await interaction.editReply("Ran out of time.")
    })
  }
}
