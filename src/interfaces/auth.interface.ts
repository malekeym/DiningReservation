import { Request } from 'express';
import { User } from '@interfaces/users.interface';




export interface RequestWithUser extends Request {
  user: User;
}


export interface ThirdpartyResponse{
  access_token : string,
  token_type : "bearer",
  refresh_token : string,
  expires_in : number,
  scope : "read write",
  user_id : number,
  first_name : string,
  last_name : string,
  national_code : string,
  jti : string
}