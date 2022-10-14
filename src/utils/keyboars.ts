import MESSAGES from '@/constants/messages';
import { ONE_WEEK } from '@/constants/time';
import { Markup } from 'telegraf';

export const reserveKeyboard = Markup.keyboard([[Markup.button.callback(MESSAGES.lostCode, ''), Markup.button.callback(MESSAGES.reserve, '')]]);

export const backKeyboard = Markup.keyboard([Markup.button.callback(MESSAGES.back, '')]);

export const reserveListKeyboad = Markup.keyboard([
  [Markup.button.callback(MESSAGES.showReserveList, ''), Markup.button.callback(MESSAGES.newReserve, '')],
]);

export const lostCodeKeyboad = Markup.keyboard([
  [Markup.button.callback(MESSAGES.getLostCode, ''), Markup.button.callback(MESSAGES.reportBadCode, '')],
  [Markup.button.callback(MESSAGES.shareLostCode, '')],
]);

export const nextWeekKeyboard = (id: string, today: number, prefix?: string) => {
  const finalPrefix = prefix ? `${prefix}-` : '';
  return Markup.inlineKeyboard([[Markup.button.callback(MESSAGES.nextWeek, `${finalPrefix}nextWeek-${id}-${today + ONE_WEEK}`)]]);
};
