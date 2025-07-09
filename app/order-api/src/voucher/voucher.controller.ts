import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  Query,
  StreamableFile,
} from '@nestjs/common';
import { VoucherService } from './voucher.service';
import {
  BulkCreateVoucherDto,
  CreateVoucherDto,
  ExportPdfVoucherDto,
  GetAllVoucherDto,
  GetAllVoucherForUserDto,
  GetAllVoucherForUserPublicDto,
  GetVoucherDto,
  ValidateVoucherDto,
  ValidateVoucherPublicDto,
  VoucherResponseDto,
} from './voucher.dto';
import { UpdateVoucherDto } from './voucher.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HasRoles } from 'src/role/roles.decorator';
import { RoleEnum } from 'src/role/role.enum';
import { ApiResponseWithType } from 'src/app/app.decorator';
import { AppPaginatedResponseDto, AppResponseDto } from 'src/app/app.dto';
import { Public } from 'src/auth/decorator/public.decorator';

@Controller('voucher')
@ApiTags('Voucher')
@ApiBearerAuth()
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Post()
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create voucher' })
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'Voucher has been created successfully',
    type: VoucherResponseDto,
  })
  async create(
    @Body(new ValidationPipe({ transform: true }))
    createVoucherDto: CreateVoucherDto,
  ) {
    const result = await this.voucherService.create(createVoucherDto);
    return {
      message: 'Voucher has been created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<VoucherResponseDto>;
  }

  @Post('bulk')
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bulk create voucher' })
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'Vouchers have been created successfully',
    type: String,
  })
  async bulkCreate(
    @Body(new ValidationPipe({ transform: true }))
    bulkCreateVoucherDto: BulkCreateVoucherDto,
  ) {
    const result = await this.voucherService.bulkCreate(bulkCreateVoucherDto);
    return {
      message: 'Vouchers have been created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result: `${result.length} vouchers have been created successfully`,
    } as AppResponseDto<string>;
  }

  @Get()
  @HasRoles(RoleEnum.SuperAdmin, RoleEnum.Admin, RoleEnum.Manager)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve all voucher' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'All voucher have been retrieved successfully',
    type: VoucherResponseDto,
    isArray: true,
  })
  async findAll(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    options: GetAllVoucherDto,
  ) {
    const result = await this.voucherService.findAll(options);
    return {
      message: 'All voucher have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<AppPaginatedResponseDto<VoucherResponseDto>>;
  }

  // for user login
  // for staff order for user
  // - if user have account: isVerificationIdentity = all (no transmit)
  // - if user not have account: isVerificationIdentity = false
  @Get('order')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Retrieve all voucher for: user login (isVerificationIdentity: all - no transmit) - staff order for user -- if user have account: isVerificationIdentity = all(no transmit) -- if user not have account: isVerificationIdentity = false',
  })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'All voucher for order have been retrieved successfully',
    type: VoucherResponseDto,
    isArray: true,
  })
  async findAllForUser(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    options: GetAllVoucherForUserDto,
  ) {
    const result = await this.voucherService.findAllForUser(options);
    return {
      message: 'All voucher for order have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<AppPaginatedResponseDto<VoucherResponseDto>>;
  }

  @Get('order/public')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve all voucher for user' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description:
      'All public voucher for order have been retrieved successfully',
    type: VoucherResponseDto,
    isArray: true,
  })
  async findAllForUserPublic(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    options: GetAllVoucherForUserPublicDto,
  ) {
    const result = await this.voucherService.findAllForUserPublic(options);
    return {
      message: 'All public voucher for order have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<AppPaginatedResponseDto<VoucherResponseDto>>;
  }

  @Get('/specific')
  @HasRoles(
    RoleEnum.Customer,
    RoleEnum.Staff,
    RoleEnum.Chef,
    RoleEnum.SuperAdmin,
    RoleEnum.Admin,
    RoleEnum.Manager,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve voucher' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Voucher has been retrieved successfully',
    type: VoucherResponseDto,
  })
  async findOne(
    @Query(new ValidationPipe({ transform: true })) option: GetVoucherDto,
  ) {
    const result = await this.voucherService.findOne(option);
    return {
      message: 'Voucher has been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<VoucherResponseDto>;
  }

  @Get('/specific/public')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve voucher' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Voucher has been retrieved successfully',
    type: VoucherResponseDto,
  })
  async findOnePublic(
    @Query(new ValidationPipe({ transform: true })) option: GetVoucherDto,
  ) {
    const result = await this.voucherService.findOne(option);
    return {
      message: 'Voucher has been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<VoucherResponseDto>;
  }

  @Patch(':slug')
  @HasRoles(RoleEnum.SuperAdmin, RoleEnum.Admin, RoleEnum.Manager)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update voucher' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Voucher has been updated successfully',
    type: VoucherResponseDto,
  })
  async update(
    @Param('slug') slug: string,
    @Body(new ValidationPipe({ transform: true }))
    updateVoucherDto: UpdateVoucherDto,
  ) {
    const result = await this.voucherService.update(slug, updateVoucherDto);
    return {
      message: 'Voucher has been updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<VoucherResponseDto>;
  }

  @Delete(':slug')
  async remove(@Param('slug') slug: string) {
    const result = await this.voucherService.remove(slug);
    return {
      message: 'Voucher has been deleted successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<VoucherResponseDto>;
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate voucher before apply' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Voucher has been validated successfully',
    type: VoucherResponseDto,
  })
  async validateVoucher(
    @Body(new ValidationPipe({ transform: true }))
    validateVoucherDto: ValidateVoucherDto,
  ) {
    await this.voucherService.validateVoucher(validateVoucherDto);
    return {
      message: 'Voucher has been validated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
    } as AppResponseDto<void>;
  }

  @Post('validate/public')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate voucher before apply' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Voucher has been validated successfully',
    type: VoucherResponseDto,
  })
  async validateVoucherPublic(
    @Body(new ValidationPipe({ transform: true }))
    validateVoucherPublicDto: ValidateVoucherPublicDto,
  ) {
    await this.voucherService.validateVoucherPublic(validateVoucherPublicDto);
    return {
      message: 'Voucher has been validated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
    } as AppResponseDto<void>;
  }

  @Post('export-pdf')
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  @ApiOperation({ summary: 'Export chef order item ticket' })
  @HttpCode(HttpStatus.OK)
  async exportChefOrderItemTicket(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    exportVoucherDto: ExportPdfVoucherDto,
  ): Promise<StreamableFile> {
    const result = await this.voucherService.exportPdf(exportVoucherDto);
    return new StreamableFile(result, {
      type: 'application/pdf',
      length: result.length,
      disposition: `attachment; filename="Chef-order-${new Date().toISOString()}.pdf"`,
    });
  }
}
