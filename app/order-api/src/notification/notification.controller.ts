import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  FirebaseRegisterDeviceTokenRequestDto,
  FirebaseRegisterDeviceTokenResponseDto,
  GetAllNotificationDto,
  NotificationResponseDto,
} from './notification.dto';
import { AppPaginatedResponseDto, AppResponseDto } from 'src/app/app.dto';
import { Public } from 'src/auth/decorator/public.decorator';
import { CurrentUserDto } from 'src/user/user.dto';
import { CurrentUser } from 'src/user/user.decorator';

@Controller('notification')
@ApiTags('Notification')
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  @Public()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    options: GetAllNotificationDto,
  ) {
    const result = await this.notificationService.findAll(options);
    return {
      message: 'Get all notifications successfully',
      statusCode: HttpStatus.OK,
      result,
      timestamp: new Date().toISOString(),
    } as AppResponseDto<AppPaginatedResponseDto<NotificationResponseDto>>;
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

  @Post('firebase/register-device-token')
  @ApiOperation({ summary: 'Register device token' })
  @HttpCode(HttpStatus.OK)
  async registerDeviceToken(
    @CurrentUser(new ValidationPipe({ validateCustomDecorators: true }))
    user: CurrentUserDto,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    requestData: FirebaseRegisterDeviceTokenRequestDto,
  ) {
    const result = await this.notificationService.registerDeviceToken(
      user.userId,
      requestData,
    );
    return {
      message: 'Device token registered successfully',
      statusCode: HttpStatus.OK,
      result,
      timestamp: new Date().toISOString(),
    } as AppResponseDto<FirebaseRegisterDeviceTokenResponseDto>;
  }

  @Delete('firebase/unregister-device-token/:token')
  @ApiOperation({ summary: 'Unregister device token' })
  @HttpCode(HttpStatus.OK)
  async unregisterDeviceToken(
    @Param('token') token: string,
  ): Promise<AppResponseDto<void>> {
    await this.notificationService.unregisterDeviceToken(token);
    return {
      message: 'Device token unregistered successfully',
      statusCode: HttpStatus.NO_CONTENT,
      timestamp: new Date().toISOString(),
    } as AppResponseDto<void>;
  }
}
