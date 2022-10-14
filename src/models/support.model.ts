import { model, Schema } from 'mongoose';
import { Support } from '@/interfaces/support.interface';

const SupportSchema: Schema = new Schema({
  code: {
    type: String,
    require: true,
  },
  telegramId: {
    type: Number,
    require: true,
  },
});

const forgetCodeModel = model<Support>('Support', SupportSchema);

export default forgetCodeModel;
