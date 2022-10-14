import { Markup } from 'telegraf';

const normalizeSelfList = (data, prefix?: string) => {
  const texts = data.payload.map(({ id, name }) => `${id}:${name.replace(/\d+( ?)\-/, '')}`);

  const finalPrefix = prefix ? `${prefix}-` : '';
  const btns = data.payload.map(({ name, id }) => Markup.button.callback(name, `${finalPrefix}self-${id}`));

  return {
    text: `${data.messageFa}:\n${texts.join('\n')}`,
    btns: Markup.inlineKeyboard(btns, {
      wrap: (_btn, index, currentRow) => currentRow.length >= index / 2,
    }),
  };
};

export default normalizeSelfList;
