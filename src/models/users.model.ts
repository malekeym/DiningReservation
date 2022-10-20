import { model, Schema, Document } from 'mongoose';
import { User } from '@interfaces/users.interface';

const UserSchema: Schema = new Schema({
  refreshToken: {
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
  password: {
    type: String,
    require: true,
  },
});

const userModel = model<User>('User', UserSchema);

export default userModel;
