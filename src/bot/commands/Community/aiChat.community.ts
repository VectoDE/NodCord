import { SlashCommandBuilder } from 'discord.js';
import puppeteer from 'puppeteer';
import type { Browser } from 'puppeteer';

import type { SlashCommandModule } from '@/bot/types';

const AI_URL = 'https://chat-app-f2d296.zapier.app/';
const USER_PROMPT_SELECTOR = 'textarea[aria-label="chatbot-user-prompt"]';
const RESPONSE_PARAGRAPH_SELECTOR = '[data-testid="final-bot-response"] p';

const aiChatCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('ai')
    .setDescription('Ask the embedded AI a question.')
    .addStringOption((option) =>
      option.setName('query').setDescription('What should the AI answer?').setRequired(true),
    ),
  async execute(interaction) {
    const query = interaction.options.getString('query', true).trim();

    await interaction.deferReply({ ephemeral: true });

    let browser: Browser | null = null;
    try {
      browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(AI_URL, { waitUntil: 'domcontentloaded' });

      await page.waitForSelector(USER_PROMPT_SELECTOR, { timeout: 15_000 });
      await page.type(USER_PROMPT_SELECTOR, query);
      await page.keyboard.press('Enter');

      await page.waitForSelector(RESPONSE_PARAGRAPH_SELECTOR, { timeout: 30_000 });
      const response = await page.$$eval(RESPONSE_PARAGRAPH_SELECTOR, (elements) =>
        elements
          .map((element) => element.textContent?.trim() ?? '')
          .filter((text) => text.length > 0),
      );

      const answer = response.join('\n\n') || "I couldn't find an answer right now.";
      await interaction.editReply({ content: answer });
    } catch (error) {
      await interaction.editReply({
        content: 'I could not contact the AI service. Please try again later.',
      });
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  },
};

export default aiChatCommand;
