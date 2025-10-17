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
  DeleteVoucherUserGroupRequestDto,
  VoucherUserGroupResponseDto,
} from './voucher-user-group.dto';
import { AppResponseDto } from 'src/app/app.dto';
import { ApiOperation } from '@nestjs/swagger';
import { ApiResponseWithType } from 'src/app/app.decorator';
import { HttpStatus } from '@nestjs/common';
import { HasRoles } from 'src/role/roles.decorator';
import { RoleEnum } from 'src/role/role.enum';

@Controller('voucher-user-group')
export class VoucherUserGroupController {
  constructor(
    private readonly voucherUserGroupService: VoucherUserGroupService,
  ) {}

  @Post()
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create voucher user group' })
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'Voucher user group has been created successfully',
    type: VoucherUserGroupResponseDto,
    isArray: true,
  })
  async create(
    @Body(new ValidationPipe({ transform: true }))
    bulkCreateVoucherUserGroupDto: BulkCreateVoucherUserGroupRequestDto,
  ) {
    const result = await this.voucherUserGroupService.bulkCreate(
      bulkCreateVoucherUserGroupDto,
    );
    return {
      message: 'Voucher user group has been created successfully',
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
}
