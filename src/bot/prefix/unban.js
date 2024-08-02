const { EmbedBuilder, PermissionsBitFiel } = require('discord.js');

module.exports = {
  name: 'unban',
  description: 'Unban member from the server.',
  run: async (client, message, args) => {
    if(!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return message.channel.send("You don't have permissions to use this command.");

    const member = args[0];
    let reason = args.slice(1).join(" ") || 'No reason given.';

    const embed = new EmbedBuilder()
    .setColor('Random')
    .setDescription(`<@${member}> has been **banned** | ${reason}`)

    message.guild.bans.fetch().then(async bans => {
      if(bans.size == 0) return message.channel.send("The ID you give is not banned from this server.");

      await message.guild.bans.remove(member, reason).catch(err => {
        return message.channel.send("Error");
      });

      await message.channel.send({ embeds: [embed] });
    })
  }
}
