import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ACBConnectorService } from './acb-connector.service';
import {
  ACBConnectorConfigResponseDto,
  CreateACBConnectorConfigRequestDto,
  UpdateACBConnectorConfigRequestDto,
} from './acb-connector.dto';
import { ApiResponseWithType } from 'src/app/app.decorator';
import { AppResponseDto } from 'src/app/app.dto';
import { HasRoles } from 'src/role/roles.decorator';
import { RoleEnum } from 'src/role/role.enum';

@ApiTags('ACB Connector')
@Controller('acb-connector')
@ApiBearerAuth()
export class ACBConnectorController {
  constructor(private readonly acbConnectorService: ACBConnectorService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get ACB config' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiResponseWithType({
    type: ACBConnectorConfigResponseDto,
    description: 'ACB config retrieved successfully',
  })
  async get() {
    const result = await this.acbConnectorService.get();
    return {
      message: 'ACB config retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<ACBConnectorConfigResponseDto>;
  }

  @Post()
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create ACB config' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiResponseWithType({
    type: ACBConnectorConfigResponseDto,
    description: 'ACB config created successfully',
  })
  async create(
    @Body(new ValidationPipe({ transform: true }))
    requestData: CreateACBConnectorConfigRequestDto,
  ) {
    const result = await this.acbConnectorService.create(requestData);
    return {
      message: 'ACB config created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<ACBConnectorConfigResponseDto>;
  }

  @Put(':slug')
  @HttpCode(HttpStatus.CREATED)
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin)
  @ApiOperation({ summary: 'Update ACB config' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiResponseWithType({
    type: ACBConnectorConfigResponseDto,
    description: 'ACB config updated successfully',
  })
  async update(
    @Param('slug') slug: string,
    @Body(new ValidationPipe({ transform: true }))
    requestData: UpdateACBConnectorConfigRequestDto,
  ) {
    return this.acbConnectorService.update(slug, requestData);
  }
}
