import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { VoucherProductService } from './voucher-product.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';
import { HasRoles } from 'src/role/roles.decorator';
import { RoleEnum } from 'src/role/role.enum';
import { ApiResponseWithType } from 'src/app/app.decorator';
import {
  CreateVoucherProductRequestDto,
  DeleteVoucherProductRequestDto,
} from './voucher-product.dto';
import { AppResponseDto } from 'src/app/app.dto';

@Controller('voucher-product')
@ApiTags('Voucher Product')
@ApiBearerAuth()
export class VoucherProductController {
  constructor(private readonly voucherProductService: VoucherProductService) {}

  @HasRoles(RoleEnum.Admin, RoleEnum.SuperAdmin)
  @Get('init-voucher-product-for-existed-voucher-all-product')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Init voucher product for existed voucher all product',
  })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Init voucher product for existed voucher all product success',
    type: String,
  })
  async initVoucherProductForExistedVoucherAllProduct() {
    await this.voucherProductService.initVoucherProductForExistedVoucherAllProduct();
    return {
      result: 'Init voucher product for existed voucher all product success',
      message: 'Init voucher product for existed voucher all product success',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
    } as AppResponseDto<string>;
  }

  @Post()
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create voucher product' })
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'Voucher product has been created successfully',
    type: String,
  })
  async create(
    @Body(new ValidationPipe({ transform: true }))
    createVoucherDto: CreateVoucherProductRequestDto,
  ) {
    const result = await this.voucherProductService.create(createVoucherDto);
    return {
      message: 'Voucher product have been created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result: `${result} voucher product have been created successfully`,
    } as AppResponseDto<string>;
  }

  @Delete()
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete voucher product' })
  @ApiResponseWithType({
    status: HttpStatus.NO_CONTENT,
    description: 'Voucher product has been deleted successfully',
    type: String,
  })
  async delete(
    @Body(new ValidationPipe({ transform: true }))
    deleteVoucherProductDto: DeleteVoucherProductRequestDto,
  ) {
    await this.voucherProductService.remove(deleteVoucherProductDto);
    return {
      message: 'Voucher products have been deleted successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
    } as AppResponseDto<void>;
  }
}
