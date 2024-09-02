const { PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'kick',
  description: 'Kick member from the server.',
  run: async (client, message, args) => {
    const member =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]) ||
      message.guild.members.cache.find(
        (x) =>
          x.user.username.toLowerCase() ===
          args.slice(0).join(' ' || x.user.username === args[0])
      );

    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return message.channel.send(
        "You don't have permissions to use this command."
      );
    if (!member)
      return message.channel.send('You must specify member to kick.');
    if (message.member === member)
      return message.channel.send("You can't kick yourself!");
    if (!member.kickable)
      return message.channel.send("You can't kick this person.");

    let reason = args.slice(1).join(' ') || 'No reason provided.';

    const embed = new EmbedBuilder()
      .setColor('Random')
      .setDescription(
        `**${member.user.tag}** has been kicked. \nReason: **${reason}**`
      );

    member.kick().catch((err) => {
      message.channel.send('Error kicking member.');
      console.log('[BOT]' + err);
    });

    message.channel.send({ embeds: [embed] });
  },
};
