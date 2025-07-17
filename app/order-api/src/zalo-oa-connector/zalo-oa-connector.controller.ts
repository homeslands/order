import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ZaloOaConnectorService } from './zalo-oa-connector.service';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiResponseWithType } from 'src/app/app.decorator';
import {
  CreateZaloOaConnectorConfigRequestDto,
  ZaloOaCallbackStatusRequestDto,
  ZaloOaConnectorConfigResponseDto,
} from './zalo-oa-connector.dto';
import { AppResponseDto } from 'src/app/app.dto';
import { HasRoles } from 'src/role/roles.decorator';
import { RoleEnum } from 'src/role/role.enum';
import { Public } from 'src/auth/decorator/public.decorator';

@Controller('zalo-oa-connector')
@ApiBearerAuth()
@ApiTags('Zalo OA Connector')
export class ZaloOaConnectorController {
  constructor(
    private readonly zaloOaConnectorService: ZaloOaConnectorService,
  ) {}

  @Post()
  @HasRoles(RoleEnum.Admin, RoleEnum.SuperAdmin)
  @HttpCode(HttpStatus.CREATED)
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'Create a new zalo oa connector config successfully',
    type: ZaloOaConnectorConfigResponseDto,
  })
  @ApiOperation({ summary: 'Create new zalo oa connector config' })
  @ApiResponse({
    status: 200,
    description: 'Create new zalo oa connector config successfully',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createZaloOaConnectorConfig(
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    requestData: CreateZaloOaConnectorConfigRequestDto,
  ) {
    const result =
      await this.zaloOaConnectorService.createZaloOaConnectorConfig(
        requestData,
      );
    return {
      message: 'The zalo oa connector config have been created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<ZaloOaConnectorConfigResponseDto>;
  }

  @Get()
  @HasRoles(RoleEnum.Admin, RoleEnum.SuperAdmin)
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Get all zalo oa connector configs successfully',
    type: ZaloOaConnectorConfigResponseDto,
    isArray: true,
  })
  @ApiOperation({ summary: 'Get all zalo oa connector configs' })
  @ApiResponse({
    status: 200,
    description: 'Get all zalo oa connector configs successfully',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getAllZaloOaConnectorConfigs() {
    const result =
      await this.zaloOaConnectorService.getZaloOaConnectorConfigs();
    return {
      message: 'Zalo oa connector configs have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<ZaloOaConnectorConfigResponseDto[]>;
  }

  @Delete(':slug')
  @HasRoles(RoleEnum.Admin, RoleEnum.SuperAdmin)
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Delete zalo oa connector config successfully',
    type: String,
  })
  @ApiOperation({ summary: 'Delete zalo oa connector config' })
  @ApiResponse({
    status: 200,
    description: 'Delete zalo oa connector config successfully',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteZaloOaConnectorConfig(@Param('slug') slug: string) {
    const result =
      await this.zaloOaConnectorService.deleteZaloOaConnectorConfig(slug);
    return {
      message: 'Zalo oa connector config have been deleted successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result: `${result} records have been deleted`,
    } as AppResponseDto<string>;
  }

  @Get('callback/status')
  @Public()
  @ApiExcludeEndpoint()
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Zalo oa callback status successfully',
    type: String,
  })
  @ApiOperation({ summary: 'Call back zalo oa status' })
  @ApiResponse({ status: 200, description: 'Call back successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async zaloOaCallback(
    @Query(new ValidationPipe({ transform: true }))
    requestData: ZaloOaCallbackStatusRequestDto,
  ) {
    const result = await this.zaloOaConnectorService.callback(requestData);
    return {
      message: 'Zalo oa callback successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<string>;
  }
}
