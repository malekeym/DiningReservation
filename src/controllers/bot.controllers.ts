import { ADMINS } from '@/config';
import MESSAGES, { DAYS, UNIVERSITIES } from '@/constants/messages';
import { AUTO_RESERVE, GET_SUPPORT_MESSAGE, GET_PASSWORD, GET_SUPPORT, GET_USER_NAME, LOADING, GET_UNIVERSITY } from '@/constants/states';
import { ONE_WEEK } from '@/constants/time';
import AuthService from '@/services/auth.service';
import ForgetCodeService from '@/services/forgetCodes.service';
import SupportService from '@/services/suuport.service';
import UserService from '@/services/users.service';
import { formatDate } from '@/utils/format';
import Storage from '@/utils/in-memory-storage';
import {
  autoReserveKeyboard,
  backKeyboard,
  lostCodeKeyboad,
  nextWeekKeyboard,
  mainKeyboard,
  reserveListKeyboad,
  loginKeyboad,
  dayInlineKeyboard,
  universitiesKeyboard,
} from '@/utils/keyboars';
import { logger } from '@/utils/logger';
import { normalizeLostCodeMessage, getLostCodeSuccess } from '@/utils/normalize-lost-code';
import normalizeProgramData, { formatReservation } from '@/utils/normalize-program-data';
import normalizeReservation, { formatReservedText } from '@/utils/normalize-reservation';
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
    bot.help(this.help);
    bot.command('about', this.handleAbout);
    bot.command('support', this.handleSupport);
    bot.command('show_reserves', this.handleNewReserve);
    bot.command('reserve', this.handleNewReserve);
    bot.command('exit', this.handleLogout);
    bot.command('send_next_week_reserve', this.sendMessageToAll);

    bot.hears(MESSAGES.logout, this.handleLogout);
    bot.hears(MESSAGES.reserve, this.handleNewReserve);
    bot.hears(MESSAGES.login, this.checkIsLogin);
    bot.hears(MESSAGES.back, this.welcomeToBot);
    bot.hears(MESSAGES.about, this.handleAbout);
    bot.hears(MESSAGES.support, this.handleSupport);
    bot.hears(MESSAGES.myInfo, this.handleMyInfo);
    bot.hears(MESSAGES.autoReserve, this.handleAutoReserve);
    bot.hears(MESSAGES.showAutoReserveStatus, this.handleAutoReserve);
    bot.hears(MESSAGES.activateAutoReserve, this.handleActivateAutoReserve);
    bot.hears(MESSAGES.deActivateAutoReserve, this.handleDeActivateAutoReserve);
    bot.hears(MESSAGES.changeAutoReserveDays, this.changeAutoReserveSetting);
    bot.action(/(\d)-day/, this.handleAddDayToAutoReserve);
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

  private help: MiddlewareFn<Context<Update>> = ctx => {
    ctx.replyWithMarkdown(MESSAGES.help + MESSAGES.tag);
  };

  private handleLogout: MiddlewareFn<Context<Update>> = async ctx => {
    try {
      await this.userService.logout(ctx.from.id);
      ctx.replyWithMarkdown(MESSAGES.successFullyLogout + MESSAGES.tag, loginKeyboad);
    } catch {
      ctx.replyWithMarkdown(MESSAGES.unsuccessFullOperation + MESSAGES.tag, mainKeyboard);
    }
  };

  private welcomeToBot: MiddlewareFn<Context<Update>> = async (ctx, next) => {
    try {
      const accessToken = await this.authService.getAccessToken(ctx.from.id);
      if (accessToken) {
        const { name } = await this.userService.getUserById(ctx.from.id);
        this.storage.removeState(ctx.from);
        return ctx.replyWithMarkdown(MESSAGES.welcome({ name }) + MESSAGES.tag, mainKeyboard);
      }
    } catch (err) {
      logger.error(err);
    }
    this.storage.setState(ctx.from, GET_UNIVERSITY);
    return ctx.replyWithMarkdown(MESSAGES.getUniversity + MESSAGES.tag, universitiesKeyboard);
  };

  private handleNewReserve: MiddlewareFn<Context<Update>> = async (ctx, next) => {
    try {
      const accessToken = await this.authService.getAccessToken(ctx.from.id);
      if (accessToken) {
        this.storage.removeState(ctx.from);
        return ctx.replyWithMarkdown(MESSAGES.findFromBelow, reserveListKeyboad);
      }
    } catch (err) {
      logger.error(err);
    }
    this.storage.setState(ctx.from, GET_UNIVERSITY);
    return ctx.replyWithMarkdown(MESSAGES.getUniversity + MESSAGES.tag, universitiesKeyboard);
  };

  private handleLoginCheck: MiddlewareFn<Context<Update>> = async ctx => {
    const { state, username, universityId } = this.storage.getState(ctx.from);
    if (state === GET_UNIVERSITY) {
      //@ts-expect-error we should why text not exist on context
      const universityId = Object.keys(UNIVERSITIES).find(key => UNIVERSITIES[key] === ctx.message.text);
      console.log(universityId);
      this.storage.setState(ctx.from, GET_USER_NAME, { universityId: universityId });
      return ctx.replyWithMarkdown(MESSAGES.getUsername + MESSAGES.tag);
    }
    if (state === GET_USER_NAME) {
      //@ts-expect-error TODO: check if text exist on type ctx.message or not
      this.storage.setState(ctx.from, GET_PASSWORD, { username: ctx.message.text });
      return ctx.replyWithMarkdown(MESSAGES.getPassword + MESSAGES.tag);
    }
    if (state === GET_PASSWORD) {
      this.storage.setState(ctx.from.id, LOADING);
      ctx.replyWithMarkdown(MESSAGES.letMeCheck);
      try {
        //@ts-expect-error TODO: check if text exist on type ctx.message or not
        const { first_name } = await this.authService.loginToSamad(username, ctx.message.text, ctx.message.from.id, universityId);
        this.storage.removeState(ctx.from);
        return ctx.replyWithMarkdown(
          `👋🏻 سلام *${first_name}*\nبه ربات رزرو خودکار غذا سلف دانشگاه خوش اومدی.\n\n🔻 یکی از دکمه های زیر را انتخاب کن.` + MESSAGES.tag,
          mainKeyboard,
        );
      } catch (error) {
        logger.error(error);
        this.storage.removeState(ctx.from);
        ctx.replyWithMarkdown(MESSAGES.wrongUsernamrOrPassword + MESSAGES.tag, backKeyboard);
      }
      return;
    }
    if (state === GET_SUPPORT) {
      this.storage.removeState(ctx.from);
      //@ts-expect-error we should why text not exist on context
      this.supportService.addToSupport({ id: ctx.from.id, code: ctx.from.text });
      return ctx.replyWithMarkdown(MESSAGES.weWouldCheck + MESSAGES.tag, backKeyboard);
    }
    if (state === GET_SUPPORT_MESSAGE) {
      this.storage.removeState(ctx.from);
      ADMINS.forEach(id => {
        ctx.forwardMessage(id).catch(err => logger.error(err));
      });
      return ctx.replyWithMarkdown(MESSAGES.supportMessageSent + MESSAGES.tag, backKeyboard);
    }
    ctx.replyWithMarkdown(MESSAGES.error + MESSAGES.tag, backKeyboard);
  };

  private sendMessageToAll: MiddlewareFn<Context<Update>> = async ctx => {
    if (!ADMINS.includes(ctx.from.id)) return;
    const text = MESSAGES.reserveNextWeekHeadsup;
    const users = await this.userService.getAllUser();
    users.forEach(user => {
      ctx.telegram.sendMessage(user.telegramId, text, { parse_mode: 'Markdown', ...reserveListKeyboad }).catch(err => logger.error(err));
    });
  };

  private handleAutoReserve: MiddlewareFn<Context<Update>> = async (ctx, next) => {
    return ctx.replyWithMarkdown(MESSAGES.notAvailable + MESSAGES.tag, mainKeyboard);
    try {
      const { text, data } = await this.userService.getAutoReserveStatus(ctx.from.id);
      ctx.replyWithMarkdown(text + MESSAGES.tag, autoReserveKeyboard(data.autoReserve));
    } catch (err) {
      if (err.message === 'unAuthorized') {
        ctx.replyWithMarkdown(MESSAGES.youShouldLoginFirst + MESSAGES.tag);
        return this.checkIsLogin(ctx, next);
      }
      ctx.replyWithMarkdown(MESSAGES.unsuccessFullOperation + MESSAGES.tag);
    }
  };

  private handleActivateAutoReserve: MiddlewareFn<Context<Update>> = async ctx => {
    try {
      await this.userService.changeAutoReserveStatus(ctx.from.id, true);
      ctx.replyWithMarkdown(MESSAGES.activateSuccessFully + MESSAGES.tag, autoReserveKeyboard(true));
    } catch {
      ctx.replyWithMarkdown(MESSAGES.unsuccessFullOperation + MESSAGES.tag, mainKeyboard);
    }
  };

  private handleDeActivateAutoReserve: MiddlewareFn<Context<Update>> = async ctx => {
    try {
      await this.userService.changeAutoReserveStatus(ctx.from.id, false);
      ctx.replyWithMarkdown(MESSAGES.deActivateSuccessFully + MESSAGES.tag, autoReserveKeyboard(false));
    } catch {
      ctx.replyWithMarkdown(MESSAGES.unsuccessFullOperation + MESSAGES.tag, mainKeyboard);
    }
  };

  private changeAutoReserveSetting: MiddlewareFn<Context<Update>> = async ctx => {
    ctx.replyWithMarkdown(MESSAGES.chooseDays + MESSAGES.tag, dayInlineKeyboard);
  };

  private handleAddDayToAutoReserve: MiddlewareFn<
    Context<Update> & {
      match: RegExpExecArray;
    }
  > = async ctx => {
    const dayIndex = ctx.match[1];
    const { isAdded } = await this.userService.updateAutoReserveDay(ctx.from.id, Number(dayIndex));
    ctx.answerCbQuery();
    ctx.replyWithMarkdown(`${DAYS[dayIndex]} ${isAdded ? MESSAGES.isAdded : MESSAGES.isRemoved}` + MESSAGES.tag);
  };

  private selfCheck: MiddlewareFn<
    Context<Update> & {
      match: RegExpExecArray;
    }
  > = async ctx => {
    const id = ctx.match[1];

    if (id) {
      ctx.replyWithMarkdown(MESSAGES.letMeSendFoods + MESSAGES.tag);
      try {
        const data = await this.userService.getPrograms(Number(id), ctx.from.id);
        const availableFoods = normalizeProgramData(data);
        if (isEmpty(availableFoods)) {
          return ctx.replyWithMarkdown(MESSAGES.notFoundFoodForThisWeek + MESSAGES.tag);
        }
        const { text, btns } = formatReservation(availableFoods);
        ctx.replyWithMarkdown(text + MESSAGES.tag, btns);
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
        return ctx.replyWithMarkdown(MESSAGES.sorryNotFoundAnyFood + MESSAGES.tag, backKeyboard);
      }

      const { btns, text } = formatReservation(availableFoods);

      return ctx.replyWithMarkdown(
        `${data.messageFa}
      ${text}` + MESSAGES.tag,
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

      ctx.replyWithMarkdown(`${type === 'SUCCESS' ? '🤝✌️🙌' : '😢⚠️'} ${messageFa}` + MESSAGES.tag, backKeyboard);
    } catch (err) {
      logger.error(err);
      ctx.replyWithMarkdown(MESSAGES.error + MESSAGES.tag, backKeyboard);
    } finally {
      ctx.answerCbQuery();
    }
  };

  private sendSelfs: (shouldReserveThisWeek: boolean) => MiddlewareFn<Context<Update>> = shouldReserveThisWeek => async ctx => {
    ctx.replyWithMarkdown(MESSAGES.letMeSendSelfs + MESSAGES.tag);
    try {
      const { text, btns } = await this.userService.getSelfs(ctx.from.id, shouldReserveThisWeek ? '' : 'nextWeek');

      ctx.replyWithMarkdown(text + MESSAGES.tag, btns);
    } catch (err) {
      logger.error(err);
    }
  };

  private checkIsLogin: MiddlewareFn<Context<Update>> = async (ctx, next) => {
    this.welcomeToBot(ctx, next);
  };

  private showReservation: MiddlewareFn<Context<Update>> = async ctx => {
    ctx.replyWithMarkdown(MESSAGES.letMeCheck);
    try {
      const data = await this.userService.getReserves(ctx.from.id);
      const reserves = data.payload.weekDays.map(formatReservedText).filter(Boolean);
      return ctx.replyWithMarkdown(reserves.length === 0 ? MESSAGES.noReserve : reserves.join('\n') + MESSAGES.tag, backKeyboard);
    } catch (err) {
      logger.error(err);
    }
    ctx.replyWithMarkdown(MESSAGES.notFound + MESSAGES.tag, backKeyboard);
  };

  private showNextWeekReservation: MiddlewareFn<Context<Update>> = async ctx => {
    ctx.replyWithMarkdown(MESSAGES.letMeCheck);
    const date = (await this.userService.getReserves(ctx.from.id)).payload.weekDays[0].date;
    const firstDayOfWeek = new Date(date).getTime();
    const nextWeek = formatDate(new Date(firstDayOfWeek + ONE_WEEK));
    try {
      const data = await this.userService.getReserves(ctx.from.id, nextWeek);
      const reserves = data.payload.weekDays.map(formatReservedText).filter(Boolean);
      return ctx.replyWithMarkdown((reserves.length === 0 ? MESSAGES.noReserve : reserves.join('\n')) + MESSAGES.tag, backKeyboard);
    } catch (err) {
      logger.error(err);
    }
    ctx.replyWithMarkdown(MESSAGES.notFound + MESSAGES.tag, backKeyboard);
  };

  private handleLostCode: MiddlewareFn<Context<Update>> = async (ctx, next) => {
    try {
      const accessToken = await this.authService.getAccessToken(ctx.from.id);
      if (!accessToken) {
        this.storage.setState(ctx.from, GET_UNIVERSITY);
        return ctx.replyWithMarkdown(MESSAGES.getUniversity + MESSAGES.tag, universitiesKeyboard);
      }
    } catch (err) {
      logger.error(err);
    }
    ctx.replyWithMarkdown(MESSAGES.findFromBelow + MESSAGES.tag, lostCodeKeyboad);
  };

  private handleReportBadCode: MiddlewareFn<Context<Update>> = async ctx => {
    this.storage.setState(ctx.from, GET_SUPPORT);
    ctx.replyWithMarkdown(MESSAGES.supportLostCode + MESSAGES.tag);
  };

  private handleSendSelfsForLostCode: MiddlewareFn<Context<Update>> = async ctx => {
    try {
      const { text, btns } = await this.userService.getSelfs(ctx.from.id, 'lostCode');
      ctx.replyWithMarkdown(text + MESSAGES.tag, btns);
    } catch {}
  };

  private handleSelectedSelfForLostCode: MiddlewareFn<
    Context<Update> & {
      match: RegExpExecArray;
    }
  > = async ctx => {
    const selfId = Number(ctx.match[1]);
    try {
      const { date } = (await this.userService.getCurrentPorgram(selfId, ctx.from.id)) || {};
      if (!date) {
        return ctx.replyWithMarkdown(MESSAGES.notFoundProgram + MESSAGES.tag);
      }
      const currentDate = new Date(date);
      const data = await this.forgetCodeService.getLostCode(selfId, currentDate, ctx.from.id);
      if (!data) {
        return ctx.replyWithMarkdown(MESSAGES.notFoundLostCode + MESSAGES.tag);
      }
      ctx.replyWithMarkdown(getLostCodeSuccess(data.forgetCode) + MESSAGES.tag, backKeyboard);
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
        return ctx.replyWithMarkdown(MESSAGES.notFoundFoodForThisWeek + MESSAGES.tag, nextWeekKeyboard('', dateTime, 'lostCode'));
      }
      return ctx.replyWithMarkdown(text + MESSAGES.tag, btns);
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
        return ctx.replyWithMarkdown(MESSAGES.sorryNotFoundAnyFood + MESSAGES.tag, backKeyboard);
      }

      return ctx.replyWithMarkdown(text + MESSAGES.tag, btns);
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

      ctx.replyWithMarkdown(normalizeLostCodeMessage(data) + MESSAGES.tag, backKeyboard);
    } catch (err) {
      logger.error(err);
      ctx.replyWithMarkdown(MESSAGES.unSuccessFullLostCode + MESSAGES.tag);
    } finally {
      ctx.answerCbQuery();
    }
  };

  private handleAbout: MiddlewareFn<Context<Update>> = async (ctx, next) => {
    try {
      return await ctx.replyWithMarkdown(MESSAGES.aboutMessage, {
        keyboard: backKeyboard,
        disable_web_page_preview: false,
      });
    } catch (err) {
      logger.error(err);
    }
  };

  private handleSupport: MiddlewareFn<Context<Update>> = async (ctx, next) => {
    try {
      this.storage.setState(ctx.from, GET_SUPPORT_MESSAGE);
      return ctx.replyWithMarkdown(MESSAGES.supportMessage + MESSAGES.tag, backKeyboard);
    } catch (err) {
      logger.error(err);
    }
  };

  private handleMyInfo: MiddlewareFn<Context<Update>> = async (ctx, next) => {
    try {
      const { name, username, universityId, credit, lastName } = await this.userService.getUserInfo(ctx.from.id);
      const infoMessage = MESSAGES.myInfoMessage({ name, lastName, username, uniName: UNIVERSITIES[universityId], id: ctx.from.id, credit });

      return ctx.replyWithMarkdown(infoMessage + MESSAGES.tag, backKeyboard);
    } catch (err) {
      logger.error(err);
    }
  };
}

export default TelegramBot;
