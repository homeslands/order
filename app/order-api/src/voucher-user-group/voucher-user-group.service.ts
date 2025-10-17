import { Inject, Injectable, Logger } from '@nestjs/common';
import { VoucherUserGroup } from './voucher-user-group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BulkCreateVoucherUserGroupRequestDto,
  DeleteVoucherUserGroupRequestDto,
  VoucherUserGroupResponseDto,
} from './voucher-user-group.dto';
import { Mapper } from '@automapper/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { InjectMapper } from '@automapper/nestjs';
import { Voucher } from 'src/voucher/entity/voucher.entity';
import { UserGroup } from 'src/user-group/user-group.entity';
import { VoucherException } from 'src/voucher/voucher.exception';
import { VoucherValidation } from 'src/voucher/voucher.validation';
import { UserGroupException } from 'src/user-group/user-group.exception';
import { UserGroupValidation } from 'src/user-group/user-group.validation';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { VoucherUserGroupException } from './voucher-user-group.exception';
import { VoucherUserGroupValidation } from './voucher-user-group.validation';

@Injectable()
export class VoucherUserGroupService {
  constructor(
    @InjectRepository(VoucherUserGroup)
    private readonly voucherUserGroupRepository: Repository<VoucherUserGroup>,
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    @InjectRepository(UserGroup)
    private readonly userGroupRepository: Repository<UserGroup>,
    @InjectMapper()
    private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly transactionManagerService: TransactionManagerService,
  ) {}

  async bulkCreate(
    bulkCreateVoucherUserGroupDto: BulkCreateVoucherUserGroupRequestDto,
  ): Promise<VoucherUserGroupResponseDto[]> {
    const context = `${VoucherUserGroupService.name}.${this.bulkCreate.name}`;

    const voucherUserGroups: VoucherUserGroup[] = [];
    const userGroups: UserGroup[] = [];
    const vouchers: Voucher[] = [];
    for (const voucherSlug of bulkCreateVoucherUserGroupDto.vouchers) {
      const voucher = await this.voucherRepository.findOne({
        where: { slug: voucherSlug },
      });
      if (!voucher) {
        this.logger.warn(`Voucher not found`, context);
        throw new VoucherException(VoucherValidation.VOUCHER_NOT_FOUND);
      }
      vouchers.push(voucher);
    }
    for (const userGroupSlug of bulkCreateVoucherUserGroupDto.userGroups) {
      const userGroup = await this.userGroupRepository.findOne({
        where: { slug: userGroupSlug },
      });
      if (!userGroup) {
        this.logger.warn(`User group not found`, context);
        throw new UserGroupException(UserGroupValidation.USER_GROUP_NOT_FOUND);
      }
      userGroups.push(userGroup);
    }
    for (const voucher of vouchers) {
      for (const userGroup of userGroups) {
        const existingVoucherUserGroup =
          await this.voucherUserGroupRepository.findOne({
            where: {
              voucher: { id: voucher.id },
              userGroup: { id: userGroup.id },
            },
          });
        if (!existingVoucherUserGroup) {
          const voucherUserGroup = new VoucherUserGroup();
          voucherUserGroup.voucher = voucher;
          voucherUserGroup.userGroup = userGroup;
          voucherUserGroups.push(voucherUserGroup);
        }
      }
    }
    const createdVoucherUserGroups =
      await this.transactionManagerService.execute<VoucherUserGroup[]>(
        async (manager) => {
          return await manager.save(voucherUserGroups);
        },
        (result) => {
          this.logger.log(
            `${result.length} voucher user groups created successfully`,
            context,
          );
        },
        (error) => {
          this.logger.error(
            `Failed to create voucher user group`,
            error.stack,
            context,
          );
          throw new VoucherUserGroupException(
            VoucherUserGroupValidation.CREATE_VOUCHER_USER_GROUP_FAILED,
          );
        },
      );
    return this.mapper.mapArray(
      createdVoucherUserGroups,
      VoucherUserGroup,
      VoucherUserGroupResponseDto,
    );
  }

  async delete(requestData: DeleteVoucherUserGroupRequestDto): Promise<void> {
    const context = `${VoucherUserGroupService.name}.${this.delete.name}`;
    const voucherUserGroup = await this.voucherUserGroupRepository.findOne({
      where: {
        slug: requestData.voucher,
        userGroup: { slug: requestData.userGroup },
      },
    });
    if (!voucherUserGroup) {
      this.logger.warn(`Voucher user group not found`, context);
      throw new VoucherUserGroupException(
        VoucherUserGroupValidation.VOUCHER_USER_GROUP_NOT_FOUND,
      );
    }
    await this.transactionManagerService.execute<VoucherUserGroup>(
      async (manager) => {
        return await manager.softRemove(voucherUserGroup);
      },
      (result) => {
        this.logger.log(
          `Voucher user group deleted successfully: ${result.slug}`,
          context,
        );
      },
      (error) => {
        this.logger.error(
          `Failed to delete voucher user group`,
          error.stack,
          context,
        );
        throw new VoucherUserGroupException(
          VoucherUserGroupValidation.DELETE_VOUCHER_USER_GROUP_FAILED,
        );
      },
    );
  }
}
