import MESSAGES from '@/constants/messages';
import { Programs, SelfProgram } from '@/interfaces/users.interface';
import { Markup } from 'telegraf';

const normalizeProgramData = (data: Programs) => {
  if (!data.payload) {
    return [];
  }
  const selectedDay = data.payload.selfWeekPrograms
    .filter(([item]) => {
      const { daysDifferenceWithToday, mealTypeId, programId } = item;
      const isNotReserved = () => (data.payload.userWeekReserves || []).findIndex(item => item.programId === programId) === -1;
      return data.payload.mealTypeReserveLimitMap[mealTypeId]?.days <= daysDifferenceWithToday && isNotReserved();
    })
    .flat();

  return selectedDay;
};

export const formatReserveText = (data: SelfProgram, index: number) => {
  const foodData = data.programFoodTypes[0];
  return `
  ${MESSAGES.number}: ${index + 1}
  ${MESSAGES.mealType}: ${data.mealTypeName}
  ${MESSAGES.foodName}: ${foodData.foodNames}
  ${MESSAGES.price}: ${foodData.price} ${MESSAGES.currency}
  ${MESSAGES.date}: ${new Date(data.date).toLocaleDateString('fa-IR')}
  `;
};

export const formatReserveButton = (data: SelfProgram, index: number) => {
  const foodData = data.programFoodTypes[0];

  return [Markup.button.callback(`${index + 1}-${foodData.foodNames}`, `reserve-${data.programId}-${foodData.foodTypeId}`)];
};

export const formatReservation = (data: Array<SelfProgram>) => {
  const text = data.map(formatReserveText).join('');
  const btns = data.map(formatReserveButton).flat();
  return {
    text,
    btns: Markup.inlineKeyboard(btns, {
      wrap: (_btn, index, currentRow) => currentRow.length >= index / 2,
    }),
  };
};

export default normalizeProgramData;
