import {
  Body,
  Controller,
  Get,
  Param,
  ParseFilePipe,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
  FileTypeValidator,
  MaxFileSizeValidator,
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
import { FileInterceptor } from '@nestjs/platform-express';

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

  @Post('/dp')
  @UseInterceptors(FileInterceptor('profile-pic'))
  async uploadDp(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: '.(png|jpeg|jpg|svg|avif|tiff|gif)',
          }),
          new MaxFileSizeValidator({
            maxSize: 4 * 1024 * 1024,
            message: 'Validation failed (expected size is less than 5MB)',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @GetUser() user: IJwtUser,
  ) {
    return await this.userService.uploadDp(file, user);
  }

  @Get('/dp')
  async getDp(@GetUser() user: IJwtUser) {
    return this.userService.getDp(user);
  }

  @Post('/:id/follow')
  async follow(@GetUser() user: IJwtUser, @Param('id') userId: string) {
    return this.userService.follow(userId, user);
  }

  @Post('/:id/unfollow')
  async unfollow(@GetUser() user: IJwtUser, @Param('id') userId: string) {
    return this.userService.unfollow(userId, user);
  }

  @Get('followers/:id')
  async getFollowers(@Param('id') userId: string) {
    return this.userService.getFollowers(userId);
  }

  @Get('following/:id')
  async getFollowing(@Param('id') userId: string) {
    return this.userService.getFollowing(userId);
  }
}
