import { Inject, Injectable, Logger } from '@nestjs/common';
import { VoucherGroup } from './voucher-group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { FindManyOptions, Repository } from 'typeorm';
import { Mapper } from '@automapper/core';
import {
  CreateVoucherGroupRequestDto,
  GetAllVoucherGroupRequestDto,
  UpdateVoucherGroupRequestDto,
  VoucherGroupResponseDto,
} from './voucher-group.dto';
import { VoucherGroupException } from './voucher-group.exception';
import { VoucherGroupValidation } from './voucher-group.validation';
import { AppPaginatedResponseDto } from 'src/app/app.dto';
import { VoucherGroupUtils } from './voucher-group.utils';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class VoucherGroupService {
  constructor(
    @InjectRepository(VoucherGroup)
    private readonly voucherGroupRepository: Repository<VoucherGroup>,
    @InjectMapper()
    private readonly mapper: Mapper,
    private readonly voucherGroupUtils: VoucherGroupUtils,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  async create(
    createVoucherGroupDto: CreateVoucherGroupRequestDto,
  ): Promise<VoucherGroupResponseDto> {
    const hasVoucherGroup = await this.voucherGroupRepository.findOne({
      where: {
        title: createVoucherGroupDto.title,
      },
    });

    if (hasVoucherGroup) {
      throw new VoucherGroupException(
        VoucherGroupValidation.VOUCHER_GROUP_ALREADY_EXISTS,
      );
    }

    const voucherGroup = this.mapper.map(
      createVoucherGroupDto,
      CreateVoucherGroupRequestDto,
      VoucherGroup,
    );

    await this.voucherGroupRepository.save(voucherGroup);
    return this.mapper.map(voucherGroup, VoucherGroup, VoucherGroupResponseDto);
  }

  async findAll(
    query: GetAllVoucherGroupRequestDto,
  ): Promise<AppPaginatedResponseDto<VoucherGroupResponseDto>> {
    const findManyOptions: FindManyOptions<VoucherGroup> = {
      order: { createdAt: 'DESC' },
    };

    if (query.hasPaging) {
      Object.assign(findManyOptions, {
        skip: (query.page - 1) * query.size,
        take: query.size,
      });
    }
    const [voucherGroups, total] =
      await this.voucherGroupRepository.findAndCount(findManyOptions);
    const totalPages = Math.ceil(total / query.size);
    const hasNext = query.page < totalPages;
    const hasPrevious = query.page > 1;

    const voucherGroupsDto = this.mapper.mapArray(
      voucherGroups,
      VoucherGroup,
      VoucherGroupResponseDto,
    );

    return {
      hasNext,
      hasPrevios: hasPrevious,
      items: voucherGroupsDto,
      total,
      page: query.hasPaging ? query.page : 1,
      pageSize: query.hasPaging ? query.size : total,
      totalPages,
    } as AppPaginatedResponseDto<VoucherGroupResponseDto>;
  }

  async update(
    slug: string,
    updateVoucherGroupDto: UpdateVoucherGroupRequestDto,
  ): Promise<VoucherGroupResponseDto> {
    const context = `${VoucherGroupService.name}.${this.update.name}`;
    const voucherGroup = await this.voucherGroupUtils.getVoucherGroup({
      where: { slug },
    });

    Object.assign(voucherGroup, updateVoucherGroupDto);

    const updatedVoucherGroup =
      await this.voucherGroupRepository.save(voucherGroup);
    this.logger.log(
      `Voucher group updated successfully: ${updatedVoucherGroup.title}`,
      context,
    );
    return this.mapper.map(
      updatedVoucherGroup,
      VoucherGroup,
      VoucherGroupResponseDto,
    );
  }
}
