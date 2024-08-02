const { PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'purge',
  description: 'To purge a message.',
  run: async (message, args) => {
    if(!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return message.channel.send("You don't have permissions to use this command.");

    const amount = parseInt(args[0]);
    if(isNaN(amount) || amount <= 0 || amount > 100){
      return message.reply('Please provide a valid number between 1 and 100.');
    }

    message.channel.bulkDelete(amount).then((deletedMessages) => {
      message.channel.send(`Successfully deleted **${deletedMessages.size}** messages.`).then((msg) => {
        setTimeout(() => {
          msg.delete();
        }, 5000);
      });
    }).catch((error) => {
      console.error('Error!', error);
      message.channel.send("An error occurred!");
    });
  }
}
