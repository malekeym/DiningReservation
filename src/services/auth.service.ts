import fetch from 'node-fetch';
import { HttpException } from '@exceptions/HttpException';
import userModel from '@models/users.model';
import { ThirdpartyResponse } from '@/interfaces/auth.interface';
import AuthRepository from '@/models/auth.model';
import { decrypt, encrypt } from '@/utils/crypto';
import { ONE_SECONDS } from '@/constants/time';

class AuthService {
  private users = userModel;
  private auth = new AuthRepository();

  private getAccessTokenFromRedis = (telegramId: number) => {
    return this.auth.client.get(telegramId.toString());
  };

  public removeAccessTokenFromRedis = (telegramId: number) => {
    return this.auth.client.unlink(telegramId.toString());
  };

  public loginToSamad = async (username: string, password: string, telegramId: number): Promise<ThirdpartyResponse> => {
    const response = await fetch('https://refahi.kntu.ac.ir/oauth/token', {
      headers: {
        authorization: 'Basic c2FtYWQtbW9iaWxlOnNhbWFkLW1vYmlsZS1zZWNyZXQ=',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      body: `username=${username}&password=${password}&grant_type=password&scope=read+write`,
      method: 'POST',
    });
    if (response.status !== 200) {
      throw new HttpException(401, 'Unauthorized');
    }
    const data: ThirdpartyResponse = (await response.json()) as ThirdpartyResponse;
    if (!(await this.users.findOne({ telegramId, username }))) {
      await this.users.create({
        username,
        password: encrypt(password),
        name: data.first_name,
        telegramId,
        uninversityId: 8, // hard-coded value for KNTU university
      });
    }
    await this.auth.client.set(telegramId.toString(), data.access_token);
    this.auth.client.expire(telegramId.toString(), data.expires_in);
    return data;
  };

  public getAccessToken = async (telegramId: number) => {
    const accessToken = await this.getAccessTokenFromRedis(telegramId);
    if (accessToken) {
      return accessToken;
    }

    const { username, password: hashPassword } = await this.users.findOne({ telegramId });
    const password = decrypt(hashPassword);
    const { access_token } = await this.loginToSamad(username, password, telegramId);
    return access_token;
  };
}

export default AuthService;
