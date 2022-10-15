import fetch from 'node-fetch';
import { HttpException } from '@exceptions/HttpException';
import userModel from '@models/users.model';
import { ThirdpartyResponse } from '@/interfaces/auth.interface';
import AuthRepository from '@/models/auth.model';
import { logger } from '@/utils/logger';

class AuthService {
  private users = userModel;
  private auth = new AuthRepository();

  private getAccessTokenFromRedis = (telegramId: number) => {
    return this.auth.client.get(telegramId.toString());
  };

  public loginToSamad = async (username: string, password: string, telegramId: number) => {
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
        telegramId,
        refreshToken: data.refresh_token,
      });
    }
    await this.auth.client.set(telegramId.toString(), data.access_token);
    this.auth.client.expire(telegramId.toString(), data.expires_in);
  };

  public getAccessToken = async (telegramId: number) => {
    const accessToken = await this.getAccessTokenFromRedis(telegramId);
    logger.info(accessToken);
    if (accessToken) {
      return accessToken;
    }

    const { refreshToken } = await this.users.findOne({ telegramId });
    const response = await fetch('https://refahi.kntu.ac.ir/oauth/token', {
      headers: {
        authorization: 'Basic c2FtYWQtbW9iaWxlOnNhbWFkLW1vYmlsZS1zZWNyZXQ=',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
      method: 'POST',
    });
    if (response.status === 200) {
      const data = await response.json();
      await this.auth.client.set(telegramId.toString(), data.access_token);
      this.auth.client.expire(telegramId.toString(), data.expires_in);

      return data;
    }
  };
}

export default AuthService;
