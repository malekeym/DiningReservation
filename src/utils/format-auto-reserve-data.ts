import MESSAGES, { DAYS } from '@/constants/messages';
import { User } from '@/interfaces/users.interface';

const formatDays = (array: number[]) =>
  array
    .sort((a, b) => a - b)
    .map(item => `${DAYS[item]}`)
    .join('\n');

export const formatAutoReserveData = (user: User) => {
  return `
${MESSAGES.autoReserveStatus}:
${user.autoReserve ? MESSAGES.active : MESSAGES.deActive}

${MESSAGES.activeDays}: 
${user.autoReservesDay?.length ? formatDays(user.autoReservesDay) : MESSAGES.noDay}
`;
};
