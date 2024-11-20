import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ValidationPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { TableService } from './table.service';
import { 
  CreateTableRequestDto,
  TableResponseDto,
  UpdateTableRequestDto 
} from './table.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/public.decorator';
import { ApiResponseWithType } from 'src/app/app.decorator';
import { AppResponseDto } from 'src/app/app.dto';

@ApiTags('Table')
@Controller('tables')
@ApiBearerAuth()
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Post()
  @Public()
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
  async create(
    @Body(new ValidationPipe({
    transform: true,
    whitelist: true,
    })) 
    createTableDto: CreateTableRequestDto
  ) {
    const result = await this.tableService.create(createTableDto);
    return {
      message: 'Table have been created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<TableResponseDto>;
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

  @Patch('status/:slug')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Change status table successfully',
    type: TableResponseDto,
  })
  @ApiOperation({ summary: 'Change status table' })
  @ApiResponse({ status: 200, description: 'Change status table successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the table to be changed',
    required: true,
    example: 'slug-123',
  })
  async changeStatus(
    @Param('slug') slug: string,  
  ) {
    const result = await this.tableService.changeStatus(slug);
    return {
      message: 'Status table have been changed successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<TableResponseDto>;
  }

  @Patch(':slug')
  @Public()
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
    example: 'slug-123',
  })
  async update(
    @Param('slug') slug: string, 
    @Body(new ValidationPipe({
      transform: true,
      whitelist: true,
    })) 
    updateTableDto: UpdateTableRequestDto
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
  @Public()
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
    example: 'slug-123',
  })
  async remove(@Param('slug') slug: string) {
    const result = await this.tableService.remove(slug);
    return {
      message: 'Table have been deleted successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result: `${result} table have been deleted successfully`,
    } as AppResponseDto<string>;
  }
}
