const { SlashCommandBuilder } = require('discord.js');
const puppeteer = require('puppeteer');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('ai')
  .setDescription('Ask AI.')
  .addStringOption(option => option.setName('query').setDescription('The query for the AI.').setRequired(true)),
  async execute (interaction) {
    await interaction.reply({ content: 'typing...', ephemeral: true });

    const { options } = interaction;
    const query = options.getString('query');
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://chat-app-f2d296.zapier.app/');
    const textBoxSelector = 'textarea[aria-label="chatbot-user-prompt"]';
    await page.waitForSelector(textBoxSelector);
    await page.type(textBoxSelector, query);
    await page.keyboard.press('Enter');
    await page.waitForSelector('[data-testid="final-bot-response"] p');
    let value = await page.$$eval('[data-testid="final-bot-reponse"]', async (elements) => {
      return elements.map((element) => element.textContent);
    });
    setTimeout(async () => {
      if(value.length == 0) return await interaction.editReply({ content: "Error!" });
    }, 30000);

    await browser.close();
    value.shift();
    await interaction.editReply({ content: `${value.join('\n\n\n\n')}` });


  }
}
