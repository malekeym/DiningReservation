import { MONITORING_GROUP_ID } from '@/config';
import cron from 'node-cron';
import userModel from '@/models/users.model';
import type { Telegraf } from 'telegraf';

function monitoringBot(bot: Telegraf) {
  const task = cron.schedule('* * * * *', async () => {
    const userCount = await userModel.count();
    bot.telegram.sendMessage(Number(MONITORING_GROUP_ID), `The Bot is Up & Running, the users count is ${userCount}`);
  });
  task.start();
}

export default monitoringBot;
