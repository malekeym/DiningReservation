import { model, Schema, Document } from 'mongoose';
import { User } from '@interfaces/users.interface';


const UserSchema: Schema = new Schema({
  refreshToken: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  telegramId:{
    type: Number,
    required:true
  },
});

const userModel = model<User>('User', UserSchema);

export default userModel;
