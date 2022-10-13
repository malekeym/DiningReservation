import MESSAGES from '@/constants/messages';
import { ONE_WEEK } from '@/constants/time';
import { Markup } from 'telegraf';

export const reserveKeyboard = Markup.keyboard([Markup.button.callback(MESSAGES.reserve, '')]);

export const backKeyboard = Markup.keyboard([Markup.button.callback(MESSAGES.back, '')]);

export const reserveListKeyboad = Markup.keyboard([
  [Markup.button.callback(MESSAGES.showReserveList, ''), Markup.button.callback(MESSAGES.newReserve, '')],
]);

export const nextWeekKeyboard = (id: string, today: number) =>
  Markup.inlineKeyboard([[Markup.button.callback(MESSAGES.nextWeek, `nextWeek-${id}-${today + ONE_WEEK}`)]]);
