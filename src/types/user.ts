import { Document } from 'mongoose';

export interface User extends Document {

   email: string;
   password: string;
   otp: string;
   otpExpiredDate: Date;
   otpUsed: boolean
}