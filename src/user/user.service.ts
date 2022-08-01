import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/types/user';
import { RegisterDTO } from './register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDTO } from 'src/auth/login.dto';
import { Payload } from 'src/types/payload';
import { otpGenerator } from 'src/helper/otpGenerator';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UserService {

    constructor(
        @InjectModel('User') private userModel: Model<User>,
        private mailService: MailService
      ) {}
    
      async create(RegisterDTO: RegisterDTO) {
        const { email } = RegisterDTO;
        const user = await this.userModel.findOne({ email });
        if (user) {
          throw new HttpException('user already exists', HttpStatus.BAD_REQUEST);
        }
    
        const createdUser = new this.userModel(RegisterDTO);

       
        await createdUser.save();
        return this.sanitizeUser(createdUser);
      }
      async findByPayload(payload: Payload) {
        const { email } = payload;
        return await this.userModel.findOne({ email });
      }
      
      async findByLogin(UserDTO: LoginDTO) {
        const { email, password } = UserDTO;
        const user = await this.userModel.findOne({ email });
        if (!user) {
          throw new HttpException('user doesnt exists', HttpStatus.BAD_REQUEST);
        }
        // if (await bcrypt.compare(password, user.password)) {
        if (password == user.otp) {
          return this.sanitizeUser(user)
        } else {
          throw new HttpException('invalid credential', HttpStatus.BAD_REQUEST);
        }
      }
      sanitizeUser(user: User) {
        const sanitized = user.toObject();
        delete sanitized['otp'];
        return sanitized;
      }
      async sendOTP(email: string) {
        const user = await this.userModel.findOne({ email });
        if (!user) {
          const otp = otpGenerator()
          const otpExpiredDate = new Date()
          const createdUser = new this.userModel({email, otp,otpExpiredDate });
          await this.mailService.sendUserConfirmation(user, otp);
          return createdUser.save();
        } else {
          const otp = otpGenerator()
          user.set('otp', otp);
          await this.mailService.sendUserConfirmation(user, otp);
          return user.save();
        }
      }

}
