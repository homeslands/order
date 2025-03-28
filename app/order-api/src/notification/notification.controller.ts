import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  GetAllNotificationDto,
  NotificationResponseDto,
} from './notification.dto';
import { AppResponseDto } from 'src/app/app.dto';
import { Public } from 'src/auth/decorator/public.decorator';

@Controller('notification')
@ApiTags('Notification')
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  @Public()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() options: GetAllNotificationDto) {
    const result = await this.notificationService.findAll(options);
    return {
      message: 'Get all notifications successfully',
      statusCode: HttpStatus.OK,
      result,
      timestamp: new Date().toISOString(),
    } as AppResponseDto<NotificationResponseDto[]>;
  }

  @Patch(':slug/read')
  @ApiOperation({ summary: 'Mark as read notification' })
  @HttpCode(HttpStatus.OK)
  async readNotification(@Param('slug') slug: string) {
    const result = await this.notificationService.readNotification(slug);
    return {
      message: 'Notification has been read successfully',
      statusCode: HttpStatus.OK,
      result,
      timestamp: new Date().toISOString(),
    } as AppResponseDto<NotificationResponseDto>;
  }
}
