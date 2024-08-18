const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const WordSchema = require('../../../models/wordModel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban-word')
    .setDescription('Bans a word from being used in the server, removes a ban word, or lists banned words.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) => subcommand.setName('word').setDescription('The word to ban.').addStringOption(option => option.setName('word').setDescription('The word to ban.').setRequired(true)))
    .addSubcommand((subcommand) => subcommand.setName('list').setDescription('Lists all banned words in the server.'))
    .addSubcommand((subcommand) => subcommand.setName('remove').setDescription('Removes a banned word from the server.').addStringOption(option => option.setName('word').setDescription('The word to remove from the ban list.').setRequired(true))),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'list') {
      try {
        const guildId = interaction.guild.id;
        const bannedWords = await WordSchema.find({ guildId });

        if (bannedWords.length === 0) {
          return interaction.reply('There are no banned words in this server.');
        }

        const wordList = bannedWords.map(wordObj => `||${wordObj.word}||`).join(', ');

        const embed = new EmbedBuilder()
          .setDescription(`Banned words in this server:\n\n${wordList}`)

        interaction.reply({ embeds: [embed] });
      } catch (error) {
        console.error('error listing words', error);
        interaction.reply('An error occurred while trying to list banned words.');
      }
    } else if (subcommand === 'remove') {
      const guildId = interaction.guild.id;
      const wordToRemove = interaction.options.getString('word');

      try {
        const existingWord = await WordSchema.findOne({ guildId, word: WordSchema });

        if (!existingWord) {
          return interaction.reply(`||${wordToRemove}|| is not banned in this server.`);
        }

        await existingWord.remove();

        interaction.reply(`||${wordToRemove}|| has been removed from the ban list.`);
      } catch (error) {
        console.error('Error removing word:', error);
        interaction.reply('An error occurred while trying to remove the word.');
      }
    } else {
      const guildId = interaction.guild.id;
      const wordToBan = interaction.options.getString('word');

      try {
        const existingWord = await WordSchema.findOne({ guildId, word: wordToBan });
        if (existingWord) {
          return interaction.reply(`||${wordToBan}|| is already banned in this server.`);
        }

        const newBannedWord = new WordSchema({ guildId, word: wordToBan });
        await newBannedWord.save();

        interaction.reply(`||${wordToBan}|| has been banned from being used in the server.`);
      } catch (error) {
        console.error('Error banning word:', error);
        interaction.reply('An error occurred while trying to ban the word.');
      }
    }
  }
}
