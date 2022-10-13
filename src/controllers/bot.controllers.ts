import MESSAGES from '@/constants/messages';
import { GET_PASSWORD, GET_USER_NAME, LOADING } from '@/constants/states';
import AuthService from '@/services/auth.service';
import UserService from '@/services/users.service';
import { formatDate } from '@/utils/format';
import Storage from '@/utils/in-memory-storage';
import { backKeyboard, nextWeekKeyboard, reserveKeyboard, reserveListKeyboad } from '@/utils/keyboars';
import { logger } from '@/utils/logger';
import normalizeProgramData, { formatReservation } from '@/utils/normalize-program-data';
import { isEmpty } from '@/utils/util';
import type { Telegraf } from 'telegraf';

class TelegramBot {
  private bot: Telegraf;

  private storage = new Storage();

  private authService = new AuthService();

  private userService = new UserService();

  constructor(bot: Telegraf) {
    this.bot = bot;

    bot.start(ctx => ctx.reply(MESSAGES.welcome, reserveKeyboard));
    bot.hears(MESSAGES.reserve, async ctx => {
      const accessToken = await this.authService.getAccessToken(ctx.from.id);
      if (accessToken) {
        const userData = await this.userService.getUserById(ctx.from.id);
        this.storage.removeState(ctx.from);
        return ctx.reply(`کاربر ${userData.username} خوش اومدی!`, reserveListKeyboad);
      }
      this.storage.setState(ctx.from, GET_USER_NAME);
      return ctx.reply(MESSAGES.getUsername, backKeyboard);
    });

    bot.hears(MESSAGES.back, ctx => ctx.reply(MESSAGES.welcome, reserveKeyboard));

    bot.hears(MESSAGES.showReserveList, async ctx => {
      ctx.reply(MESSAGES.letMeCheck);
      try {
        const data = await this.userService.getReserves(ctx.from.id);
        const me = data.payload.weekDays
          .map(({ mealTypes, dayTranslated }) => mealTypes?.map(({ reserve }) => `${dayTranslated}:    ${reserve?.foodNames}`).filter(Boolean))
          .filter(Boolean);
        return ctx.reply(JSON.stringify(me, null, 2).replace(/\[|\]|,/g, ''), backKeyboard);
      } catch (err) {
        logger.error(err);
      }
      ctx.reply(MESSAGES.notFound, backKeyboard);
    });

    bot.hears(MESSAGES.newReserve, async ctx => {
      ctx.reply(MESSAGES.letMeSendSelfs);
      try {
        const { text, btn } = await this.userService.getSelfs(ctx.from.id);

        ctx.reply(text, btn);
      } catch (err) {
        logger.error(err);
      }
    });

    bot.action(/reserve-(\w+)-(\w+)/, async ctx => {
      const programId = ctx.match[1];
      const foodTypeId = ctx.match[2];
      try {
        const { messageFa, type } = await this.userService.reserveFood({ programId, foodTypeId }, ctx.from.id);

        ctx.reply(`${type === 'SUCCESS' ? '🤝✌️🙌' : '😢⚠️'} ${messageFa}`, backKeyboard);
      } catch (err) {
        logger.error(err);
        ctx.reply(MESSAGES.error, backKeyboard);
      } finally {
        ctx.answerCbQuery();
      }
    });

    bot.action(/nextWeek-(\w+)-(\w+)/, async ctx => {
      const id = ctx.match[1];
      const time = ctx.match[2];

      const nextweekDate = formatDate(new Date(Number(time)));
      const data = await this.userService.getPrograms(Number(id), ctx.from.id, nextweekDate);

      const availableFoods = normalizeProgramData(data);

      ctx.answerCbQuery();
      if (isEmpty(availableFoods)) {
        return ctx.reply(MESSAGES.sorryNotFoundAnyFood, backKeyboard);
      }

      const { btns, text } = formatReservation(availableFoods);

      return ctx.reply(
        `${data.messageFa}
      ${text}`,
        btns,
      );
    });

    bot.action(/self-(\w+)/, async ctx => {
      const id = ctx.match[1];

      if (id) {
        ctx.reply(MESSAGES.letMeSendFoods);
        const data = await this.userService.getPrograms(Number(id), ctx.from.id);
        const availableFoods = normalizeProgramData(data);
        ctx.answerCbQuery();
        logger.info(JSON.stringify(availableFoods));

        if (isEmpty(availableFoods)) {
          const { date } = data.payload.selfWeekPrograms[0][0];
          const dateTime = new Date(date).getTime();
          ctx.reply(MESSAGES.notFoundFoodForThisWeek, nextWeekKeyboard(id, dateTime));
        }
      }
    });

    bot.on('message', async ctx => {
      const { state, username } = this.storage.getState(ctx.from);
      if (state === GET_USER_NAME) {
        //@ts-expect-error TODO: check if text exist on type ctx.message or not
        this.storage.setState(ctx.from, GET_PASSWORD, { username: ctx.message.text });
        return ctx.reply(MESSAGES.getPassword);
      }
      if (state === GET_PASSWORD) {
        this.storage.setState(ctx.from.id, LOADING);
        ctx.reply(MESSAGES.letMeCheck);
        try {
          //@ts-expect-error TODO: check if text exist on type ctx.message or not
          await this.authService.loginToSamad(username, ctx.message.text, ctx.message.from.id);
          this.storage.removeState(ctx.from);
          return ctx.reply(`کاربر ${username} خوش اومدی!`, reserveListKeyboad);
        } catch (error) {
          logger.error(error);
          ctx.reply(MESSAGES.wrongUsernamrOrPassword, backKeyboard);
        }
        return;
      }
      ctx.reply(MESSAGES.error, backKeyboard);
    });
  }
}

export default TelegramBot;
