import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto, PermissionResponseDto } from './permission.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponseWithType } from 'src/app/app.decorator';
import { AppResponseDto } from 'src/app/app.dto';

@Controller('permission')
@ApiTags('Permission')
@ApiBearerAuth()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create permission' })
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'Create permission successfully',
    type: PermissionResponseDto,
    isArray: true,
  })
  async bulkCreate(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createPermissionDto: CreatePermissionDto,
  ) {
    const result = await this.permissionService.bulkCreate(createPermissionDto);
    return {
      message: 'Permissions have been created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<PermissionResponseDto[]>;
  }

  @Delete(':slug')
  async remove(@Param('slug') slug: string) {
    await this.permissionService.remove(slug);
    return {
      message: 'Permission have been deleted successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
    } as AppResponseDto<void>;
  }
}
