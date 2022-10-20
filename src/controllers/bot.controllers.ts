import MESSAGES from '@/constants/messages';
import { GET_PASSWORD, GET_SUPPORT, GET_USER_NAME, LOADING } from '@/constants/states';
import { ONE_WEEK } from '@/constants/time';
import AuthService from '@/services/auth.service';
import ForgetCodeService from '@/services/forgetCodes.service';
import SupportService from '@/services/suuport.service';
import UserService from '@/services/users.service';
import { formatDate } from '@/utils/format';
import Storage from '@/utils/in-memory-storage';
import { backKeyboard, lostCodeKeyboad, nextWeekKeyboard, mainKeyboard, reserveListKeyboad } from '@/utils/keyboars';
import { logger } from '@/utils/logger';
import { normalizeLostCodeMessage, getLostCodeSuccess } from '@/utils/normalize-lost-code';
import normalizeProgramData, { formatReservation } from '@/utils/normalize-program-data';
import normalizeReservation from '@/utils/normalize-reservation';
import { isEmpty } from '@/utils/util';
import type { Context, MiddlewareFn, Telegraf } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';

class TelegramBot {
  private bot: Telegraf;

  private storage = new Storage();

  private authService = new AuthService();

  private userService = new UserService();

  private forgetCodeService = new ForgetCodeService();

  private supportService = new SupportService();

  constructor(bot: Telegraf) {
    this.bot = bot;

    bot.start(this.welcomeToBot);
    bot.hears(MESSAGES.reserve, this.checkIsLogin);
    bot.hears(MESSAGES.back, this.welcomeToBot);
    bot.hears(MESSAGES.thisWeekReserves, this.showReservation);
    bot.hears(MESSAGES.nextWeekReserves, this.showNextWeekReservation);
    bot.hears(MESSAGES.reserveThisWeek, this.sendSelfs(true));
    bot.hears(MESSAGES.reserveNextWeek, this.sendSelfs(false));
    bot.action(/reserve-(\w+)-(\w+)/, this.handleReserve);
    bot.action(/nextWeek-self-(\w+)/, this.handleNextWeekSelection);
    bot.action(/^self-(\w+)/, this.selfCheck);
    bot.hears(MESSAGES.lostCode, this.handleLostCode);
    bot.hears(MESSAGES.getLostCode, this.handleSendSelfsForLostCode);
    bot.action(/^lostCode-self-(\w+)/, this.handleSelectedSelfForLostCode);
    bot.action(/^lostCode-nextWeek-(\w+)-(\w+)/, this.handleNextWeekLostCode);
    bot.action(/^lostCode-(\d+)-(\d+)-(\d+)/, this.handleAddLostCode);
    bot.hears(MESSAGES.shareLostCode, this.handleShareLostCode);
    bot.hears(MESSAGES.reportBadCode, this.handleReportBadCode);

    bot.on('message', this.handleLoginCheck);
  }

  private welcomeToBot: MiddlewareFn<Context<Update>> = ctx => ctx.reply(MESSAGES.welcome, mainKeyboard);

  private handleLoginCheck: MiddlewareFn<Context<Update>> = async ctx => {
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
        return ctx.reply(
          `👋🏻 سلام *${username}*\nبه ربات رزرو خودکار غذا خواجه نصیر خوش اومدی.\n\n🔻 یکی از دکمه های زیر را انتخاب کن.`,
          reserveListKeyboad,
        );
      } catch (error) {
        logger.error(error);
        ctx.reply(MESSAGES.wrongUsernamrOrPassword, backKeyboard);
      }
      return;
    }
    if (state === GET_SUPPORT) {
      this.storage.removeState(ctx.from);
      //@ts-expect-error we should why text not exist on context
      this.supportService.addToSupport({ id: ctx.from.id, code: ctx.from.text });
      return ctx.reply(MESSAGES.weWouldCheck, backKeyboard);
    }
    ctx.reply(MESSAGES.error, backKeyboard);
  };

  private selfCheck: MiddlewareFn<
    Context<Update> & {
      match: RegExpExecArray;
    }
  > = async ctx => {
    const id = ctx.match[1];

    if (id) {
      ctx.reply(MESSAGES.letMeSendFoods);
      try {
        const data = await this.userService.getPrograms(Number(id), ctx.from.id);
        const availableFoods = normalizeProgramData(data);
        if (isEmpty(availableFoods)) {
          return ctx.reply(MESSAGES.notFoundFoodForThisWeek);
        }
        const { text, btns } = formatReservation(availableFoods);
        ctx.reply(text, btns);
      } catch (err) {
        logger.error(err);
      } finally {
        ctx.answerCbQuery();
      }
    }
  };

  private handleNextWeekSelection: MiddlewareFn<
    Context<Update> & {
      match: RegExpExecArray;
    }
  > = async (ctx, next) => {
    const id = Number(ctx.match[1]);
    const { date } = (await this.userService.getPrograms(Number(id), ctx.from.id)).payload.selfWeekPrograms[0][0];
    const firstDayOfWeek = new Date(date).getTime();
    const nextweekDate = formatDate(new Date(firstDayOfWeek + ONE_WEEK));
    try {
      const data = await this.userService.getPrograms(Number(id), ctx.from.id, nextweekDate);

      const availableFoods = normalizeProgramData(data);

      if (isEmpty(availableFoods)) {
        return ctx.reply(MESSAGES.sorryNotFoundAnyFood, backKeyboard);
      }

      const { btns, text } = formatReservation(availableFoods);

      return ctx.reply(
        `${data.messageFa}
      ${text}`,
        btns,
      );
    } catch (err) {
      logger.error(err);
    } finally {
      ctx.answerCbQuery();
    }
  };

  private handleReserve: MiddlewareFn<
    Context<Update> & {
      match: RegExpExecArray;
    }
  > = async ctx => {
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
  };

  private sendSelfs: (shouldReserveThisWeek: boolean) => MiddlewareFn<Context<Update>> = shouldReserveThisWeek => async ctx => {
    ctx.reply(MESSAGES.letMeSendSelfs);
    try {
      const { text, btns } = await this.userService.getSelfs(ctx.from.id, shouldReserveThisWeek ? '' : 'nextWeek');

      ctx.reply(text, btns);
    } catch (err) {
      logger.error(err);
    }
  };

  private checkIsLogin: MiddlewareFn<Context<Update>> = async ctx => {
    try {
      const accessToken = await this.authService.getAccessToken(ctx.from.id);
      if (accessToken) {
        const userData = await this.userService.getUserById(ctx.from.id);
        this.storage.removeState(ctx.from);
        return ctx.reply(
          `👋🏻 سلام *${userData.username}*\nبه ربات رزرو خودکار غذا خواجه نصیر خوش اومدی.\n\n🔻 یکی از دکمه های زیر را انتخاب کن.`,
          reserveListKeyboad,
        );
      }
    } catch (err) {
      logger.error(err);
    }
    this.storage.setState(ctx.from, GET_USER_NAME);
    return ctx.reply(MESSAGES.getUsername, backKeyboard);
  };

  private showReservation: MiddlewareFn<Context<Update>> = async ctx => {
    ctx.reply(MESSAGES.letMeCheck);
    try {
      const data = await this.userService.getReserves(ctx.from.id);
      const reserves = data.payload.weekDays
        .map(({ mealTypes, dayTranslated }) => mealTypes?.map(({ reserve }) => `${dayTranslated}:    ${reserve?.foodNames}`).filter(Boolean))
        .filter(Boolean);
      return ctx.reply(JSON.stringify(reserves, null, 2).replace(/\[|\]|,/g, ''), backKeyboard);
    } catch (err) {
      logger.error(err);
    }
    ctx.reply(MESSAGES.notFound, backKeyboard);
  };

  private showNextWeekReservation: MiddlewareFn<Context<Update>> = async ctx => {
    ctx.reply(MESSAGES.letMeCheck);
    const date = (await this.userService.getReserves(ctx.from.id)).payload.weekDays[0].date;
    const firstDayOfWeek = new Date(date).getTime();
    const nextWeek = formatDate(new Date(firstDayOfWeek + ONE_WEEK));
    try {
      const data = await this.userService.getReserves(ctx.from.id, nextWeek);
      const reserves = data.payload.weekDays
        .map(({ mealTypes, dayTranslated }) => mealTypes?.map(({ reserve }) => `${dayTranslated}:    ${reserve?.foodNames}`).filter(Boolean))
        .filter(Boolean);
      return ctx.reply(JSON.stringify(reserves, null, 2).replace(/\[|\]|,/g, ''), backKeyboard);
    } catch (err) {
      logger.error(err);
    }
    ctx.reply(MESSAGES.notFound, backKeyboard);
  };

  private handleLostCode: MiddlewareFn<Context<Update>> = async (ctx, next) => {
    try {
      const accessToken = await this.authService.getAccessToken(ctx.from.id);
      if (!accessToken) {
        this.storage.setState(ctx.from, GET_USER_NAME);
        return ctx.reply(MESSAGES.getUsername, backKeyboard);
      }
    } catch (err) {
      logger.error(err);
    }
    ctx.reply(MESSAGES.findFromBelow, lostCodeKeyboad);
  };

  private handleReportBadCode: MiddlewareFn<Context<Update>> = async ctx => {
    this.storage.setState(ctx.from, GET_SUPPORT);
    ctx.reply(MESSAGES.supportLostCode);
  };

  private handleSendSelfsForLostCode: MiddlewareFn<Context<Update>> = async ctx => {
    try {
      const { text, btns } = await this.userService.getSelfs(ctx.from.id, 'lostCode');
      ctx.reply(text, btns);
    } catch {}
  };

  private handleSelectedSelfForLostCode: MiddlewareFn<
    Context<Update> & {
      match: RegExpExecArray;
    }
  > = async ctx => {
    const selfId = Number(ctx.match[1]);
    try {
      const { date } = await this.userService.getCurrentPorgram(selfId, ctx.from.id);
      const currentDate = new Date(date);
      const data = await this.forgetCodeService.getLostCode(selfId, currentDate, ctx.from.id);
      if (!data) {
        return ctx.reply(MESSAGES.notFoundLostCode);
      }
      ctx.reply(getLostCodeSuccess(data.forgetCode), backKeyboard);
    } catch (err) {
      logger.error(err);
    } finally {
      ctx.answerCbQuery();
    }
  };

  private handleShareLostCode: MiddlewareFn<Context<Update>> = async (ctx, next) => {
    try {
      const data = await this.userService.getReserves(ctx.from.id);
      const { btns, text } = normalizeReservation(data);
      if (isEmpty(btns.reply_markup.inline_keyboard)) {
        const { date } = data.payload.weekDays[0];
        const dateTime = new Date(date).getTime();
        return ctx.reply(MESSAGES.notFoundFoodForThisWeek, nextWeekKeyboard('', dateTime, 'lostCode'));
      }
      return ctx.reply(text, btns);
    } catch (err) {
      logger.error(err);
    }
  };

  private handleNextWeekLostCode: MiddlewareFn<
    Context<Update> & {
      match: RegExpExecArray;
    }
  > = async ctx => {
    const time = ctx.match[1];

    const nextweekDate = formatDate(new Date(Number(time)));
    try {
      const data = await this.userService.getReserves(ctx.from.id, nextweekDate);
      const { btns, text } = normalizeReservation(data);
      if (isEmpty(btns.reply_markup.inline_keyboard)) {
        return ctx.reply(MESSAGES.sorryNotFoundAnyFood, backKeyboard);
      }

      return ctx.reply(text, btns);
    } catch {
    } finally {
      ctx.answerCbQuery();
    }
  };

  private handleAddLostCode: MiddlewareFn<
    Context<Update> & {
      match: RegExpExecArray;
    }
  > = async ctx => {
    const selfId = Number(ctx.match[1]);
    const reserveId = Number(ctx.match[2]);
    const date = new Date(Number(ctx.match[3]));

    try {
      const data = await this.forgetCodeService.addLostCode({ id: ctx.from.id, reserveId, selfId, date });

      ctx.reply(normalizeLostCodeMessage(data), backKeyboard);
    } catch (err) {
      logger.error(err);
      ctx.reply(MESSAGES.unSuccessFullLostCode);
    } finally {
      ctx.answerCbQuery();
    }
  };
}

export default TelegramBot;
