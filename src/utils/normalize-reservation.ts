import MESSAGES from '@/constants/messages';
import { Reservations, Reserve } from '@/interfaces/users.interface';
import { Markup } from 'telegraf';

export const formatReservedText = ({ mealTypes, dayTranslated, dateJStr }: Reserve, index: number) => {
  if (!mealTypes) {
    return;
  }
  const [meal] = mealTypes;
  return `
    ${MESSAGES.foodName}: ${meal.reserve.foodNames}
    ${MESSAGES.selfName}: ${meal.reserve.selfCodeName}
    ${MESSAGES.day}: ${dayTranslated} ${dateJStr}
    `;
};

export const formatReservedButton = ({ mealTypes, dayTranslated }: Reserve, index: number) => {
  if (!mealTypes) {
    return;
  }
  const [meal] = mealTypes;
  const dateTime = new Date(meal.reserve.programDate).getTime();
  return [
    Markup.button.callback(
      `${index + 1}: ${dayTranslated}-${meal.reserve.foodNames}`,
      `lostCode-${meal.reserve.selfId}-${meal.reserve.id}-${dateTime}`,
    ),
  ];
};

const normalizeReserved = (data: Reservations) => {
  const tartgetWeeks = data.payload.weekDays.filter(({ mealTypes }: Reserve) => mealTypes && mealTypes[0].reserve.remainedCount > 0);
  const texts = data.payload.weekDays.map(formatReservedText).filter(Boolean);

  const btns = data.payload.weekDays.map(formatReservedButton).filter(Boolean).flat();

  return {
    text: `${data.messageFa}:\n${texts.join('\n')}`,
    btns: Markup.inlineKeyboard(btns, {
      wrap: (_btn, index, currentRow) => currentRow.length >= index / 2,
    }),
  };
};

export default normalizeReserved;
