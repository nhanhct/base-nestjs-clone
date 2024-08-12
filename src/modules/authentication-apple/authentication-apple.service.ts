import {
  Injectable,
} from '@nestjs/common';
import { AuthenticationApple, AuthAppleFillableFields } from './authentication-apple.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthenticationAppleService {
  constructor(
    @InjectRepository(AuthenticationApple)
    private readonly authAppleRepository: Repository<AuthenticationApple>,
  ) { }

  //check AppleId
  async checkAppleId(appleId: string) {
    const apple = await this.authAppleRepository.findOne({
      where: { apple_id: appleId }
    });

    return apple;
  }

  //add auth_apple
  async addAppleId(authApple: AuthAppleFillableFields) {
    //create
    authApple.create_at = new Date()
    authApple.status = true
    return await this.authAppleRepository.save(authApple);
  }

}
