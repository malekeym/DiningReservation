import MESSAGES, { DAYS } from '@/constants/messages';
import { ONE_WEEK } from '@/constants/time';
import { Markup } from 'telegraf';
import { UNIVERSITIES } from '@/constants/messages';

export const mainKeyboard = Markup.keyboard([
  [Markup.button.text(MESSAGES.setAutoReserve), Markup.button.text(MESSAGES.reserve)],
  [Markup.button.text(MESSAGES.lostCode)],
  // [Markup.button.text(MESSAGES.nextWeekFoods), Markup.button.text(MESSAGES.thisWeekFoods)],
  [Markup.button.text(MESSAGES.nextWeekReserves), Markup.button.text(MESSAGES.thisWeekReserves)],
  // [Markup.button.text(MESSAGES.changeSecondPass)],
  [Markup.button.text(MESSAGES.myInfo)],
  [Markup.button.text(MESSAGES.about), Markup.button.text(MESSAGES.support)],
  [Markup.button.text(MESSAGES.logout)],
]).resize();

export const backKeyboard = Markup.keyboard([Markup.button.text(MESSAGES.back)]).resize();

export const reserveListKeyboad = Markup.keyboard([
  [Markup.button.text(MESSAGES.reserveNextWeek), Markup.button.text(MESSAGES.reserveThisWeek)],
  [Markup.button.text(MESSAGES.back)],
]).resize();

export const loginKeyboad = Markup.keyboard([[Markup.button.text(MESSAGES.login)], [Markup.button.text(MESSAGES.back)]]).resize();

export const lostCodeKeyboad = Markup.keyboard([
  [Markup.button.text(MESSAGES.getLostCode), Markup.button.text(MESSAGES.reportBadCode)],
  [Markup.button.text(MESSAGES.shareLostCode)],
  [Markup.button.text(MESSAGES.back)],
]).resize();

export const universitiesKeyboad = Markup.keyboard([
  [Markup.button.text(UNIVERSITIES[2])],
  [Markup.button.text(UNIVERSITIES[3])],
  [Markup.button.text(UNIVERSITIES[6])],
  [Markup.button.text(UNIVERSITIES[7])],
  [Markup.button.text(UNIVERSITIES[8])],
  [Markup.button.text(UNIVERSITIES[24])],
]).resize();

export const nextWeekKeyboard = (id: string, today: number, prefix?: string) => {
  const finalPrefix = prefix ? `${prefix}-` : '';
  return Markup.inlineKeyboard([[Markup.button.callback(MESSAGES.nextWeek, `${finalPrefix}nextWeek-${id}-${today + ONE_WEEK}`)]]).resize();
};

export const autoReserveKeyboard = (isActive: boolean) =>
  Markup.keyboard([
    [
      Markup.button.text(MESSAGES.changeAutoReserveDays),
      Markup.button.text(isActive ? MESSAGES.deActivateAutoReserve : MESSAGES.activateAutoReserve),
    ],
    [Markup.button.text(MESSAGES.showAutoReserveStatus)],
    [Markup.button.text(MESSAGES.back)],
  ]).resize();

export const dayInlineKeyboard = Markup.inlineKeyboard(
  DAYS.map((item, index) => Markup.button.callback(item, `${index}-day`)),
  { wrap: (_btn, index, currentRow) => currentRow.length >= index / 2 },
).resize();
