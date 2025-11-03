import { ActivityType, Events, type Client } from 'discord.js';

import logger from '@/services/logger.service';

import type { BotEventModule, NodCordClient } from '@/bot/types';

const STATUS_ROTATION: Array<{ name: string; type: ActivityType }> = [
  { name: 'coming soon...', type: ActivityType.Watching },
  { name: 'Server Management', type: ActivityType.Playing },
  { name: 'Games for Users', type: ActivityType.Playing },
  { name: 'Support Feature', type: ActivityType.Listening },
  { name: '/help for helpmenu', type: ActivityType.Playing },
];

const readyEvent: BotEventModule<'clientReady'> = {
  name: Events.ClientReady,
  once: true,
  async execute(client: NodCordClient, readyClient: Client<true>) {
    const activeClient = readyClient ?? client;
    const username = activeClient.user?.username ?? 'Unknown Bot';
    logger.info(`[BOT] Logged in as ${username}`);

    if (!activeClient.user) return;

    const updatePresence = () => {
      const index = Math.floor(Math.random() * STATUS_ROTATION.length);
      const status = STATUS_ROTATION[index] ?? STATUS_ROTATION[0];
      if (!status) return;
      activeClient.user?.setPresence({ activities: [{ name: status.name, type: status.type }] });
    };

    updatePresence();
    setInterval(updatePresence, 30_000);
  },
};

export default readyEvent;
