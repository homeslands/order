import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TableService } from './table.service';
import {
  BulkCreateTablesRequestDto,
  CreateTableRequestDto,
  TableResponseDto,
  UpdateTableRequestDto,
  UpdateTableStatusRequestDto,
} from './table.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/auth/decorator/public.decorator';
import { ApiResponseWithType } from 'src/app/app.decorator';
import { AppResponseDto } from 'src/app/app.dto';
import { QRLocationResponseDto } from 'src/robot-connector/robot-connector.dto';
import { RoleEnum } from 'src/role/role.enum';
import { HasRoles } from 'src/role/roles.decorator';

@ApiTags('Table')
@Controller('tables')
@ApiBearerAuth()
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'Table created successfully',
    type: TableResponseDto,
  })
  @ApiOperation({ summary: 'Create a new table' })
  @ApiResponse({
    status: 200,
    description: 'Create a new table successfully',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin)
  async create(
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    createTableDto: CreateTableRequestDto,
  ) {
    const result = await this.tableService.create(createTableDto);
    return {
      message: 'Table have been created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<TableResponseDto>;
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'Many tables created successfully',
    type: TableResponseDto,
  })
  @ApiOperation({ summary: 'Create many tables' })
  @ApiResponse({
    status: 200,
    description: 'Create many tables successfully',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin)
  // @Public()
  async bulkCreate(
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    bulkCreateTablesDto: BulkCreateTablesRequestDto,
  ) {
    const result =
      await this.tableService.bulkCreateTables(bulkCreateTablesDto);
    return {
      message: `${result.length} tables have been created successfully`,
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<TableResponseDto[]>;
  }

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Get all tables successfully',
    type: TableResponseDto,
    isArray: true,
  })
  @ApiOperation({ summary: 'Get all tables' })
  @ApiResponse({ status: 200, description: 'Get all tables successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiQuery({
    name: 'branch',
    required: false,
    description: 'Filter products by branch',
    type: String,
  })
  async findAll(@Query('branch') branch: string) {
    const result = await this.tableService.findAll(branch);
    return {
      message: 'Table have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<TableResponseDto[]>;
  }

  @Patch(':slug/status')
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Change status table successfully',
    type: TableResponseDto,
  })
  @ApiOperation({ summary: 'Change status table' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the table to be changed',
    required: true,
    example: '',
  })
  async changeStatus(
    @Param('slug') slug: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    requestData: UpdateTableStatusRequestDto,
  ) {
    const result = await this.tableService.changeStatus(slug, requestData);
    return {
      message: 'Status table have been changed successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<TableResponseDto>;
  }

  @Patch(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Update table successfully',
    type: TableResponseDto,
  })
  @ApiOperation({ summary: 'Update table' })
  @ApiResponse({ status: 200, description: 'Update table successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the table to be updated',
    required: true,
    example: '',
  })
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin)
  async update(
    @Param('slug') slug: string,
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    updateTableDto: UpdateTableRequestDto,
  ) {
    const result = await this.tableService.update(slug, updateTableDto);
    return {
      message: 'Table have been updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<TableResponseDto>;
  }

  @Delete(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Delete table successfully',
    type: String,
  })
  @ApiOperation({ summary: 'Delete table' })
  @ApiResponse({ status: 200, description: 'Delete table successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the table to be deleted',
    required: true,
    example: '',
  })
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin)
  async remove(@Param('slug') slug: string) {
    const result = await this.tableService.remove(slug);
    return {
      message: 'Table have been deleted successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result: `${result} table have been deleted successfully`,
    } as AppResponseDto<string>;
  }

  @Get('locations')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Get all table locations successfully',
    type: QRLocationResponseDto,
    isArray: true,
  })
  @ApiOperation({ summary: 'Get all table locations' })
  @ApiResponse({
    status: 200,
    description: 'Get all table locations successfully',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getLocations() {
    const result = await this.tableService.getLocations();
    return {
      message: 'Table locations have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<QRLocationResponseDto[]>;
  }
}
