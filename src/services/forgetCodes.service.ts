import AuthService from './auth.service';
import fetch from 'node-fetch';
import forgetCodeModel from '@/models/forgetCode.model';
import { ForgetCodeData } from '@/interfaces/users.interface';
import UserService from './users.service';

class ForgetCodeService {
  private authService = new AuthService();
  private userService = new UserService();

  private forgetCodes = forgetCodeModel;

  public addLostCode = async ({ id, reserveId, selfId, date }: { id: number; reserveId: number; selfId: number; date: Date }) => {
    const accessToken = await this.authService.getAccessToken(id);
    const { universityId } = await this.userService.getUserById(id);

    const response = await fetch(`https://refahi.kntu.ac.ir/rest/forget-card-codes/print?reserveId=${reserveId}&count=1`, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      method: 'GET',
    });
    const data = (await response.json()) as ForgetCodeData;
    if (data.payload.remainCount <= 0) {
      throw new Error('used food cannot share between students');
    }
    if (this.forgetCodes.findOne({ forgetCode: data.payload.forgetCode, universityId, selfId })) {
      throw new Error('this code is already used');
    }
    await this.forgetCodes.create({
      forgetCode: data.payload.forgotCardCode,
      telegramId: id,
      username: data.payload.username,
      selfId,
      used: false,
      universityId,
      date: date.toISOString(),
    });
    return data;
  };

  public getLostCode = async (selfId: number, date: Date, telegramId: number) => {
    const { universityId } = await this.userService.getUserById(telegramId);
    return this.forgetCodes.findOneAndUpdate({ selfId, universityId, date: date.toISOString(), used: false }, { used: true, usedBy: telegramId });
  };

  public findAllCodes = (telegramId: number) => {
    return this.forgetCodes.find({ telegramId });
  };
}

export default ForgetCodeService;
