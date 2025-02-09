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
} from '@nestjs/common';
import { VoucherService } from './voucher.service';
import {
  CreateVoucherDto,
  GetAllVoucherDto,
  GetVoucherDto,
  ValidateVoucherDto,
  VoucherResponseDto,
} from './voucher.dto';
import { UpdateVoucherDto } from './voucher.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HasRoles } from 'src/role/roles.decorator';
import { RoleEnum } from 'src/role/role.enum';
import { ApiResponseWithType } from 'src/app/app.decorator';
import { AppResponseDto } from 'src/app/app.dto';

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

  @Get()
  @HasRoles(
    RoleEnum.Customer,
    RoleEnum.Staff,
    RoleEnum.Chef,
    RoleEnum.SuperAdmin,
    RoleEnum.Admin,
    RoleEnum.Manager,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve all voucher' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'All voucher have been retrieved successfully',
    type: VoucherResponseDto,
    isArray: true,
  })
  async findAll(
    @Query(new ValidationPipe({ transform: true })) options: GetAllVoucherDto,
  ) {
    const result = await this.voucherService.findAll(options);
    return {
      message: 'All voucher have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<VoucherResponseDto[]>;
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
}
