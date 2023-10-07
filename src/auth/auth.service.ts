import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async validateUser(username: string, password: string) {
    const hashingRounds = 10;
    const user = await this.userService.getUserByUsername(username);
    if (
      user &&
      user.password === (await bcrypt.hash(password, hashingRounds))
    ) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
