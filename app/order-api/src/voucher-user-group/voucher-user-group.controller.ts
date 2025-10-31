import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { VoucherUserGroupService } from './voucher-user-group.service';
import {
  BulkCreateVoucherUserGroupRequestDto,
  BulkDeleteVoucherUserGroupRequestDto,
  DeleteVoucherUserGroupRequestDto,
  VoucherUserGroupResponseDto,
} from './voucher-user-group.dto';
import { AppResponseDto } from 'src/app/app.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponseWithType } from 'src/app/app.decorator';
import { HttpStatus } from '@nestjs/common';
import { HasRoles } from 'src/role/roles.decorator';
import { RoleEnum } from 'src/role/role.enum';

@Controller('voucher-user-group')
@ApiTags('Voucher User Group')
@ApiBearerAuth()
export class VoucherUserGroupController {
  constructor(
    private readonly voucherUserGroupService: VoucherUserGroupService,
  ) {}

  @Post('bulk')
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bulk create voucher user group' })
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'Voucher user groups have been created successfully',
    type: VoucherUserGroupResponseDto,
    isArray: true,
  })
  async bulkCreate(
    @Body(new ValidationPipe({ transform: true }))
    bulkCreateVoucherUserGroupDto: BulkCreateVoucherUserGroupRequestDto,
  ) {
    const result = await this.voucherUserGroupService.bulkCreate(
      bulkCreateVoucherUserGroupDto,
    );
    return {
      message: 'Voucher user groups have been created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<VoucherUserGroupResponseDto[]>;
  }

  @Delete('voucher/:voucherSlug/user-group/userGroupSlug')
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete voucher user group' })
  async delete(
    @Param('voucherSlug') voucherSlug: string,
    @Param('userGroupSlug') userGroupSlug: string,
  ) {
    await this.voucherUserGroupService.delete({
      voucher: voucherSlug,
      userGroup: userGroupSlug,
    } as DeleteVoucherUserGroupRequestDto);
    return {
      message: 'Voucher user group has been deleted successfully',
      statusCode: HttpStatus.NO_CONTENT,
      timestamp: new Date().toISOString(),
    } as AppResponseDto<void>;
  }

  @Delete('bulk')
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Bulk delete voucher user groups' })
  @ApiResponseWithType({
    status: HttpStatus.NO_CONTENT,
    description: 'Voucher user groups have been deleted successfully',
    type: String,
  })
  async bulkDelete(
    @Body(new ValidationPipe({ transform: true }))
    deleteVoucherProductDto: BulkDeleteVoucherUserGroupRequestDto,
  ) {
    await this.voucherUserGroupService.bulkRemove(deleteVoucherProductDto);
    return {
      message: 'Voucher user groups have been deleted successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
    } as AppResponseDto<void>;
  }
}
