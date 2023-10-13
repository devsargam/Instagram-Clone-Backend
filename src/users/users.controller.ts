import { Body, Controller, Param, Put, UsePipes } from '@nestjs/common';
import { UsersService } from './users.service';
import { ZodValidationPipe } from 'src/zod/zod.pipe';
import { changePasswordDto, changePasswordSchema } from './dto';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Put('/:id/password')
  @UsePipes(new ZodValidationPipe(changePasswordSchema))
  async changePassword(
    @Param('id') userId: string,
    @Body() body: changePasswordDto,
  ) {
    return this.userService.changePassword(userId, body);
  }
}
