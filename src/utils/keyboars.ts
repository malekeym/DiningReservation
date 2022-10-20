import MESSAGES, { DAYS } from '@/constants/messages';
import { ONE_WEEK } from '@/constants/time';
import { Markup } from 'telegraf';

export const mainKeyboard = Markup.keyboard([
  [Markup.button.callback(MESSAGES.setAutoReserve, ''), Markup.button.callback(MESSAGES.reserve, '')],
  [Markup.button.callback(MESSAGES.lostCode, ''), Markup.button.callback(MESSAGES.changeSecondPass, '')],
  [Markup.button.callback(MESSAGES.nextWeekReserves, ''), Markup.button.callback(MESSAGES.thisWeekReserves, '')],
  [Markup.button.callback(MESSAGES.logout, '')],
]);

export const backKeyboard = Markup.keyboard([Markup.button.callback(MESSAGES.back, '')]);

export const reserveListKeyboad = Markup.keyboard([
  [Markup.button.callback(MESSAGES.reserveThisWeek, ''), Markup.button.callback(MESSAGES.reserveNextWeek, '')],
  [Markup.button.callback(MESSAGES.back, '')],
]);

export const lostCodeKeyboad = Markup.keyboard([
  [Markup.button.callback(MESSAGES.getLostCode, ''), Markup.button.callback(MESSAGES.reportBadCode, '')],
  [Markup.button.callback(MESSAGES.shareLostCode, '')],
  [Markup.button.callback(MESSAGES.back, '')],
]);

export const nextWeekKeyboard = (id: string, today: number, prefix?: string) => {
  const finalPrefix = prefix ? `${prefix}-` : '';
  return Markup.inlineKeyboard([[Markup.button.callback(MESSAGES.nextWeek, `${finalPrefix}nextWeek-${id}-${today + ONE_WEEK}`)]]);
};

export const autoReserveKeyboard = (isActive: boolean) =>
  Markup.keyboard([
    [
      Markup.button.callback(MESSAGES.changeAutoReserveDays, ''),
      Markup.button.callback(isActive ? MESSAGES.deActivateAutoReserve : MESSAGES.activateAutoReserve, ''),
    ],
    [Markup.button.callback(MESSAGES.back, '')],
  ]);

export const dayInlineKeyboard = Markup.inlineKeyboard(
  DAYS.map((item, index) => Markup.button.callback(item, `${index}-day`)),
  { wrap: (_btn, index, currentRow) => currentRow.length >= index / 2 },
);
