import { Programs, ReservationResponse, Reservations } from '@/interfaces/users.interface';
import { formatAutoReserveData } from '@/utils/format-auto-reserve-data';

import normalizeSelfList from '@/utils/normalize-self-list';
import userModel from '@models/users.model';
import fetch from 'node-fetch';
import AuthService from './auth.service';
import { UNIVERSITIES_URL } from '@/constants/universities';

class UserService {
  private users = userModel;

  private authService = new AuthService();

  public getSelfs = async (id: number, prefix?: string) => {
    const accessToken = await this.authService.getAccessToken(id);
    const { uninversityId } = await this.getUserById(id);
    const data = await fetch(`${UNIVERSITIES_URL[uninversityId]}/rest/selfs`, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      method: 'GET',
    });
    return normalizeSelfList(await data.json(), prefix);
  };

  public getReserves = async (id: number, date = ''): Promise<Reservations> => {
    const accessToken = await this.authService.getAccessToken(id);
    const { uninversityId } = await this.getUserById(id);

    const data = await fetch(`${UNIVERSITIES_URL[uninversityId]}/rest/reserves?weekStartDate=${date}`, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      method: 'GET',
    });
    return data.json();
  };

  public getDailySellPrograms = async (id: number) => {
    const accessToken = await this.authService.getAccessToken(id);
    const { uninversityId } = await this.getUserById(id);

    const data = await fetch(`${UNIVERSITIES_URL[uninversityId]}/rest/daily-sell-programs`, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      method: 'GET',
    });
    return data.json();
  };

  public getPrograms = async (selectedSelfId: number, id: number, startDate = ''): Promise<Programs> => {
    const accessToken = await this.authService.getAccessToken(id);
    const { uninversityId } = await this.getUserById(id);

    const data = await fetch(`${UNIVERSITIES_URL[uninversityId]}/rest/programs?selectedSelfId=${selectedSelfId}&weekStartDate=${startDate}`, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      method: 'GET',
    });
    return data.json();
  };

  public reserveFood = async ({ programId, foodTypeId }: { programId: string; foodTypeId: string }, id: number): Promise<ReservationResponse> => {
    const accessToken = await this.authService.getAccessToken(id);
    const { uninversityId } = await this.getUserById(id);

    const response = await fetch(`${UNIVERSITIES_URL[uninversityId]}/rest/reserves/${programId}/reserve`, {
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: `{"foodTypeId":${Number(foodTypeId)},"freeFoodSelected":false,"mealTypeId":2,"selected":true,"selectedCount":1}`,
      method: 'PUT',
    });

    return response.json();
  };

  public getCurrentPorgram = async (selfId: number, id: number) => {
    const programs = await this.getPrograms(selfId, id);
    return programs.payload.selfWeekPrograms.flat().find(({ daysDifferenceWithToday }) => daysDifferenceWithToday === 0);
  };

  public getUserById = (telegramId: number) => {
    return this.users.findOne({ telegramId });
  };

  public logout = (telegramId: number) => {
    return Promise.all([this.users.deleteOne({ telegramId }), this.authService.removeAccessTokenFromRedis(telegramId)]);
  };

  public getAutoReserveStatus = async (telegramId: number) => {
    const userData = await this.users.findOne({ telegramId });
    if (!userData) {
      throw new Error('unAuthorized');
    }
    return { data: userData, text: formatAutoReserveData(userData) };
  };

  public changeAutoReserveStatus = async (telegramId: number, status: boolean) => {
    await this.users.updateOne({ telegramId }, { autoReserve: status });
  };

  public updateAutoReserveDay = async (telegramId: number, day: number) => {
    const { autoReservesDay = [] } = await this.users.findOne({ telegramId });
    const days = new Set([...autoReservesDay]);
    if (days.has(day)) {
      days.delete(day);
    } else {
      days.add(day);
    }
    const data = await this.users.updateOne({ telegramId }, { autoReservesDay: Array.from(days) }).exec();
    return { data, isAdded: days.has(day) };
  };
}

export default UserService;
