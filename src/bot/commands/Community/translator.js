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
    },
    {
      name: 'Chinese (Traditional)',
      value: 'zh-TW',
    },
    {
      name: 'Croatian',
      value: 'hr',
    },
    {
      name: 'Czech',
      value: 'cs',
    },
    {
      name: 'Danish',
      value: 'da',
    },
    {
      name: 'Dutch',
      value: 'nl',
    },
    {
      name: 'English',
      value: 'en',
    },
    {
      name: 'Esperanto',
      value: 'eo',
    },
    {
      name: 'Estonian',
      value: 'et',
    },
    {
      name: 'Finnish',
      value: 'fi',
    },
    {
      name: 'French',
      value: 'fr',
    },
    {
      name: 'Georgian',
      value: 'ka',
    },
    {
      name: 'German',
      value: 'de',
    },
    {
      name: 'Greek',
      value: 'el',
    },
    {
      name: 'Gujarati',
      value: 'gu',
    },
    {
      name: 'Haitian Creole',
      value: 'ht',
    },
    {
      name: 'Hebrew',
      value: 'he',
    },
    {
      name: 'Hindi',
      value: 'hi',
    },
    {
      name: 'Hmong',
      value: 'hmn',
    },
    {
      name: 'Hungarian',
      value: 'hu',
    },
    {
      name: 'Icelandic',
      value: 'is',
    },
    {
      name: 'Indonesian',
      value: 'id',
    },
    {
      name: 'Irish',
      value: 'ga',
    },
    {
      name: 'Italian',
      value: 'it',
    },
    {
      name: 'Japanese',
      value: 'ja',
    },
    {
      name: 'Kannada',
      value: 'kn',
    },
    {
      name: 'Kazakh',
      value: 'kk',
    },
    {
      name: 'Korean',
      value: 'ko',
    },
    {
      name: 'Latvian',
      value: 'lv',
    },
    {
      name: 'Lithuanian',
      value: 'lt',
    },
    {
      name: 'Macedonian',
      value:'mk',
    },
    {
      name: 'Malay',
      value:'ms',
    },
    {
      name: 'Malayalam',
      value:'ml',
    },
    {
      name: 'Marathi',
      value:'mr',
    },
    {
      name: 'Mongolian',
      value:'mn',
    },
    {
      name: 'Nepali',
      value:'ne',
    },
    {
      name: 'Norwegian',
      value:'no',
    },
    {
      name: 'Persian',
      value:'fa',
    },
    {
      name: 'Polish',
      value:'pl',
    },
    {
      name: 'Portuguese',
      value:'pt',
    },
    {
      name: 'Romanian',
      value:'ro',
    },
    {
      name: 'Russian',
      value:'ru',
    },
    {
      name: 'Scottish Gaelic',
      value:'gd',
    },
    {
      name: 'Serbian',
      value:'sr',
    },
    {
      name: 'Slovak',
      value:'sk',
    },
    {
      name: 'Slovenian',
      value:'sl',
    },
    {
      name: 'Spanish',
      value:'es',
    },
    {
      name: 'Swahili',
      value:'sw',
    },
    {
      name: 'Swedish',
      value:'sv',
    },
    {
      name: 'Tamil',
      value:'ta',
    },
    {
      name: 'Telugu',
      value:'te',
    },
    {
      name: 'Thai',
      value:'th',
    },
    {
      name: 'Turkish',
      value:'tr',
    },
    {
      name: 'Ukrainian',
      value:'uk',
    },
    {
      name: 'Urdu',
      value:'ur',
    },
    {
      name: 'Vietnamese',
      value:'vi',
    },
    {
      name: 'Welsh',
      value:'cy',
    },
    {
      name: 'Yoruba',
      value:'yo',
    },
    {
      name: 'Zulu',
      value:'zu',
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
