import MESSAGES from '@/constants/messages';
import { ForgetCodeData } from '@/interfaces/users.interface';

const normalizeLostCodeMessage = (data: ForgetCodeData) => {
  return `${MESSAGES.successFullLostCode}
${MESSAGES.selfName}: ${data.payload.self}
${MESSAGES.foodName}: ${data.payload.foodName}
    `;
};

const getLostCodeSuccess = (code: string) => {
  return `${MESSAGES.successFullLostCodeGet}
    CODE: ${code}`;
};

export { normalizeLostCodeMessage, getLostCodeSuccess };
