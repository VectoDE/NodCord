module.exports = {
  name: 'ping',
  description: 'This is the ping command.',
  run: (client, message, args) => {
    message.reply("pong!");
  }
}
