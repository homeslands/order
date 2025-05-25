import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { VoucherGroupService } from './voucher-group.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HasRoles } from 'src/role/roles.decorator';
import { RoleEnum } from 'src/role/role.enum';
import {
  CreateVoucherGroupRequestDto,
  GetAllVoucherGroupRequestDto,
  UpdateVoucherGroupRequestDto,
  VoucherGroupResponseDto,
} from './voucher-group.dto';
import { ApiResponseWithType } from 'src/app/app.decorator';
import { AppPaginatedResponseDto, AppResponseDto } from 'src/app/app.dto';

@Controller('voucher-group')
@ApiTags('Voucher Group')
@ApiBearerAuth()
export class VoucherGroupController {
  constructor(private readonly voucherGroupService: VoucherGroupService) {}

  @Post()
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create voucher group' })
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'Voucher group has been created successfully',
    type: VoucherGroupResponseDto,
  })
  async create(
    @Body(new ValidationPipe({ transform: true }))
    createVoucherGroupDto: CreateVoucherGroupRequestDto,
  ) {
    const result = await this.voucherGroupService.create(createVoucherGroupDto);
    return {
      message: 'Voucher group has been created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<VoucherGroupResponseDto>;
  }

  @Get()
  @HasRoles(RoleEnum.SuperAdmin, RoleEnum.Admin, RoleEnum.Manager)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve all voucher group' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'All voucher group have been retrieved successfully',
    type: VoucherGroupResponseDto,
    isArray: true,
  })
  async findAll(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    options: GetAllVoucherGroupRequestDto,
  ) {
    const result = await this.voucherGroupService.findAll(options);
    return {
      message: 'All voucher group have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<AppPaginatedResponseDto<VoucherGroupResponseDto>>;
  }

  @Patch(':slug')
  @HasRoles(RoleEnum.SuperAdmin, RoleEnum.Admin, RoleEnum.Manager)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update voucher group' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Voucher group has been updated successfully',
    type: VoucherGroupResponseDto,
  })
  async update(
    @Param('slug') slug: string,
    @Body(new ValidationPipe({ transform: true }))
    updateVoucherGroupDto: UpdateVoucherGroupRequestDto,
  ) {
    const result = await this.voucherGroupService.update(
      slug,
      updateVoucherGroupDto,
    );
    return {
      message: 'Voucher group has been updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<VoucherGroupResponseDto>;
  }
}
