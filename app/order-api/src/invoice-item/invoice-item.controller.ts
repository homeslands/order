import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { InvoiceItemService } from './invoice-item.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ApiTags } from '@nestjs/swagger';
import { ApiResponseWithType } from 'src/app/app.decorator';
import { AppResponseDto } from 'src/app/app.dto';
import { HasRoles } from 'src/role/roles.decorator';
import { RoleEnum } from 'src/role/role.enum';

@Controller('invoice-item')
@ApiTags('Invoice Item')
@ApiBearerAuth()
export class InvoiceItemController {
  constructor(private readonly invoiceItemService: InvoiceItemService) {}

  @HasRoles(RoleEnum.Admin, RoleEnum.SuperAdmin)
  @Get('update-discount-type-for-existed-invoice-item')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update discount type for existed invoice item' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Update discount type for existed invoice item success',
    type: String,
  })
  async updateDiscountTypeForExistedInvoiceItem() {
    await this.invoiceItemService.updateDiscountTypeForExistedInvoiceItem();
    return {
      result: 'Update discount type for existed invoice item success',
      message: 'Update discount type for existed invoice item success',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
    } as AppResponseDto<string>;
  }
}
