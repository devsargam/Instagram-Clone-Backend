import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ZodValidationPipe } from 'src/common/pipes/zod.pipe';
import { changePasswordDto, changePasswordSchema } from './dto';
import {
  changeUsernameDto,
  changeUsernameSchema,
} from './dto/change-username.dto';
import { editProfileDto, editProfileSchema } from './dto/edit-profile.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { IJwtUser } from 'src/shared/interfaces';

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
    return this.userService.changeUsername(userId, body);
  }

  @Post('/preferences')
  @UsePipes(new ZodValidationPipe(editProfileSchema))
  async editProfile(@Body() body: editProfileDto, @GetUser() user: IJwtUser) {
    return this.userService.editProfile(user, body);
  }

  @Get('/preferences/')
  async getProfile(@GetUser() user: IJwtUser) {
    return this.userService.getProfile(user);
  }

  @Post('/:id/follow')
  async follow(@GetUser() user: IJwtUser, @Param('id') userId: string) {
    return this.userService.follow(userId, user);
  }
}
