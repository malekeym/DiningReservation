import { Markup } from 'telegraf';

const normalizeSelfList = data => {
  const texts = data.payload.map(({ id, name }) => `${id}:${name.replace(/\d+( ?)\-/, '')}`);

  const btns = data.payload.map(({ name, id }) => Markup.button.callback(name, `self-${id}`));

  return {
    text: `${data.messageFa}:\n${texts.join('\n')}`,
    btn: Markup.inlineKeyboard(btns, {
      wrap: (_btn, index, currentRow) => currentRow.length >= index / 2,
    }),
  };
};

export default normalizeSelfList;
