import { model, Schema } from 'mongoose';
import { ForgetCode } from '@/interfaces/forgetCode.interface';

const ForgetCodeSchema: Schema = new Schema({
  forgetCode: {
    type: String,
    require: true,
  },
  username: {
    type: String,
    require: true,
  },
  telegramId: {
    type: Number,
    require: true,
  },

  selfId: {
    type: Number,
    require: true,
  },

  date: {
    type: Date,
    require: true,
  },
  used: {
    type: Boolean,
    require: true,
  },
  usedBy: {
    type: Number,
  }
});

const forgetCodeModel = model<ForgetCode>('ForgetCode', ForgetCodeSchema);

export default forgetCodeModel;
