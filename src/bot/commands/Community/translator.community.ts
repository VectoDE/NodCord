const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const translate = require('translate-google');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('translate')
  .setDescription('Use the translate to translate into your native languages!')
  .addStringOption(option => option.setName('text').setDescription('What do you want to translate into?').setRequired(true))
  .addStringOption(option => option.setName('to').setDescription('What language do you want to translate into?').setRequired(true).addChoices([
    {
      name: 'Afrikaans',
      value: 'af',
    },
    {
      name: 'Albanian',
      value: 'sq',
    },
    {
      name: 'Amharic',
      value: 'am',
    },
    {
      name: 'Arabic',
      value: 'ar',
    },
    {
      name: 'Armenian',
      value: 'hy',
    },
    {
      name: 'Azerbaijani',
      value: 'az',
    },
    {
      name: 'Basque',
      value: 'eu',
    },
    {
      name: 'Belarusian',
      value: 'be',
    },
    {
      name: 'Bengali',
      value: 'bn',
    },
    {
      name: 'Bosnian',
      value: 'bs',
    },
    {
      name: 'Bulgarian',
      value: 'bg',
    },
    {
      name: 'Catalan',
      value: 'ca',
    },
    {
      name: 'Cebuano',
      value: 'ceb',
    },
    {
      name: 'Chichewa',
      value: 'ny',
    },
    {
      name: 'Chinese (Simplified)',
      value: 'zh-CN',
    }
  ]))
  .addBooleanOption(option => option.setName('hidden').setDescription('Should the response be hidden?').setRequired(false)),
  async execute (interaction) {
    const { options } = interaction;
    const text = options.getString('text');
    const to = options.getString('to');
    const hidden = options.getString('hidden') || false;
    await interaction.deferReply({ ephemeral: hidden });
    await interaction.reply({ content: "Your message is being translated, please wait..." });

    try {
      const translatedText = await translate(text, { to });
      const embed = new EmbedBuilder()
      .setColor('Random')
      .setTitle('Translation Result')
      .setDescription(`Original: ${text}\nTranslated: **${translatedText}**.`)

      await interaction.editReply({ content: ``, embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply('There was an error!');
    }
  }
}
