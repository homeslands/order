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
import { ChefAreaService } from './chef-area.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiResponseWithType } from 'src/app/app.decorator';
import {
  ChefAreaResponseDto,
  CreateChefAreaRequestDto,
  QueryGetChefAreaRequestDto,
  UpdateChefAreaRequestDto,
} from './chef-area.dto';
import { AppResponseDto } from 'src/app/app.dto';
import { HasRoles } from 'src/role/roles.decorator';
import { RoleEnum } from 'src/role/role.enum';
import {
  CreatePrinterRequestDto,
  PrinterResponseDto,
  UpdatePrinterRequestDto,
} from 'src/printer/printer.dto';

@Controller('chef-area')
@ApiBearerAuth()
@ApiTags('Chef Area')
export class ChefAreaController {
  constructor(private readonly chefAreaService: ChefAreaService) {}

  @Post()
  @HasRoles(RoleEnum.SuperAdmin, RoleEnum.Admin, RoleEnum.Manager)
  // @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new chef area' })
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'The new chef area was created successfully',
    type: ChefAreaResponseDto,
  })
  async create(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    requestData: CreateChefAreaRequestDto,
  ) {
    const result = await this.chefAreaService.create(requestData);
    return {
      message: 'The new chef area was created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<ChefAreaResponseDto>;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve all chef areas' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'All chef areas have been retrieved successfully',
    type: ChefAreaResponseDto,
    isArray: true,
  })
  @HasRoles(
    RoleEnum.Staff,
    RoleEnum.Chef,
    RoleEnum.Manager,
    RoleEnum.Admin,
    RoleEnum.SuperAdmin,
  )
  async getAll(
    @Query(new ValidationPipe({ transform: true }))
    query: QueryGetChefAreaRequestDto,
  ) {
    const result = await this.chefAreaService.getAll(query);
    return {
      message: 'All chef areas have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<ChefAreaResponseDto[]>;
  }

  @Get('specific/:slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve specific chef areas' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Specific chef area have been retrieved successfully',
    type: ChefAreaResponseDto,
  })
  @ApiResponse({ status: 200, description: 'Retrieved chef area successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the chef area to be retrieved',
    required: true,
    example: '',
  })
  // @Public()
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  async getSpecific(@Param('slug') slug: string) {
    const result = await this.chefAreaService.getSpecific(slug);
    return {
      message: 'Specific chef area have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<ChefAreaResponseDto>;
  }

  @Patch(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Update chef area successfully',
    type: ChefAreaResponseDto,
  })
  @ApiOperation({ summary: 'Update chef area' })
  @ApiResponse({ status: 200, description: 'Update chef area successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the chef area to be updated',
    required: true,
    example: '',
  })
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  // @Public()
  async update(
    @Param('slug') slug: string,
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    updateData: UpdateChefAreaRequestDto,
  ) {
    const result = await this.chefAreaService.update(slug, updateData);

    return {
      message: 'Chef area have been updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<ChefAreaResponseDto>;
  }

  @Delete(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Delete chef area successfully',
    type: String,
  })
  @ApiOperation({ summary: 'Delete chef area' })
  @ApiResponse({ status: 200, description: 'Delete chef area successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the chef area to be deleted',
    required: true,
    example: '',
  })
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  // @Public()
  async delete(@Param('slug') slug: string): Promise<AppResponseDto<string>> {
    const result = await this.chefAreaService.delete(slug);
    return {
      message: 'Banner have been deleted successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result: `${result} chef areas have been deleted successfully`,
    } as AppResponseDto<string>;
  }

  @Post(':slug/printer')
  @HasRoles(RoleEnum.SuperAdmin, RoleEnum.Admin, RoleEnum.Manager)
  // @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new printer for chef area' })
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'The new printer for chef area was created successfully',
    type: PrinterResponseDto,
  })
  async createPrinter(
    @Param('slug') slug: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    requestData: CreatePrinterRequestDto,
  ) {
    const result = await this.chefAreaService.createPrinter(slug, requestData);
    return {
      message: 'The new printer for chef area was created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<PrinterResponseDto>;
  }

  @Patch(':slug/printer/:printerSlug')
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Update printer successfully',
    type: PrinterResponseDto,
  })
  @ApiOperation({ summary: 'Update printer' })
  @ApiResponse({ status: 200, description: 'Update printer successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the chef area to be updated printer',
    required: true,
    example: '',
  })
  @ApiParam({
    name: 'printerSlug',
    description: 'The slug of the printer to be updated',
    required: true,
    example: '',
  })
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  async updatePrinter(
    @Param('slug') slug: string,
    @Param('printerSlug') printerSlug: string,
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    updateData: UpdatePrinterRequestDto,
  ) {
    const result = await this.chefAreaService.updatePrinter(
      slug,
      printerSlug,
      updateData,
    );

    return {
      message: 'Printer have been updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<PrinterResponseDto>;
  }

  @Patch(':slug/printer/:printerSlug/toggle')
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Update printer successfully',
    type: PrinterResponseDto,
  })
  @ApiOperation({ summary: 'Toggle printer' })
  @ApiResponse({ status: 200, description: 'Toggle printer successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the chef area to be updated printer',
    required: true,
    example: '',
  })
  @ApiParam({
    name: 'printerSlug',
    description: 'The slug of the printer to be updated',
    required: true,
    example: '',
  })
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  async togglePrinter(
    @Param('slug') slug: string,
    @Param('printerSlug') printerSlug: string,
  ) {
    const result = await this.chefAreaService.togglePrinter(slug, printerSlug);

    return {
      message: 'Printer have been updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<PrinterResponseDto>;
  }

  @Delete(':slug/printer/:printerSlug')
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Delete printer for chef area successfully',
    type: String,
  })
  @ApiOperation({ summary: 'Delete printer for chef area' })
  @ApiResponse({
    status: 200,
    description: 'Delete printer for chef area successfully',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'printerSlug',
    description: 'The slug of the printer to be deleted',
    required: true,
    example: '',
  })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the chef area to be deleted printer',
    required: true,
    example: '',
  })
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  async deletePrinter(
    @Param('slug') slug: string,
    @Param('printerSlug') printerSlug: string,
  ): Promise<AppResponseDto<string>> {
    const result = await this.chefAreaService.deletePrinter(slug, printerSlug);
    return {
      message: 'Printer for chef area have been deleted successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result: `${result} printers have been deleted successfully`,
    } as AppResponseDto<string>;
  }

  @Get(':slug/printers')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve all printers for chef area' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'All printers for chef area have been retrieved successfully',
    type: PrinterResponseDto,
    isArray: true,
  })
  @ApiResponse({
    status: 200,
    description: 'All printers for chef area have been retrieved successfully',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the chef area to be retrieved',
    required: true,
    example: '',
  })
  @HasRoles(RoleEnum.SuperAdmin, RoleEnum.Admin, RoleEnum.Manager)
  async getAllPrinters(@Param('slug') slug: string) {
    const result = await this.chefAreaService.getAllPrinters(slug);
    return {
      message: 'All printers for chef area have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<PrinterResponseDto[]>;
  }

  @Post(':slug/printer/:printerSlug/ping')
  @HasRoles(RoleEnum.SuperAdmin, RoleEnum.Admin, RoleEnum.Manager)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ping printer' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Ping printer successfully',
    type: String,
  })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the chef area to be pinged printer',
    required: true,
    example: '',
  })
  @ApiParam({
    name: 'printerSlug',
    description: 'The slug of the printer to be pinged',
    required: true,
    example: '',
  })
  async pingPrinter(
    @Param('slug') slug: string,
    @Param('printerSlug') printerSlug: string,
  ) {
    await this.chefAreaService.pingPrinter(slug, printerSlug);
    return {
      message: 'Ping printer successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result: 'Ping printer successfully',
    } as AppResponseDto<string>;
  }
}
