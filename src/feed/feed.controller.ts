import { Controller, Get } from '@nestjs/common';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { IJwtUser } from 'src/shared/interfaces';
import { FeedService } from './feed.service';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  getFeed(@GetUser() user: IJwtUser) {
    return this.feedService.getFeed(user);
  }

  @Get('/suggestions')
  getSuggestions(@GetUser() user: IJwtUser) {
    return this.feedService.getSuggestions(user);
  }
}
