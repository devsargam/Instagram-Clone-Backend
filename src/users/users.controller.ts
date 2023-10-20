import { Body, Controller, Param, Post, Put, UsePipes } from '@nestjs/common';
import { UsersService } from './users.service';
import { ZodValidationPipe } from 'src/zod/zod.pipe';
import { changePasswordDto, changePasswordSchema } from './dto';
import {
  changeUsernameDto,
  changeUsernameSchema,
} from './dto/change-username.dto';
import { editProfileDto, editProfileSchema } from './dto/edit-profile.dto';

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

  @Put('/:id/username')
  @UsePipes(new ZodValidationPipe(changeUsernameSchema))
  async changeUsername(
    @Param('id') userId: string,
    @Body() body: changeUsernameDto,
  ) {
    console.log(userId);
    console.log(body);
    this.userService.changeUsername(userId, body);
  }

  @Post('/edit')
  @UsePipes(new ZodValidationPipe(editProfileSchema))
  async editProfile(@Body() body: editProfileDto) {
    console.log(body);
    return {
      status: 'ok',
    };
  }
}
