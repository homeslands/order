import { Inject, Injectable, Logger } from '@nestjs/common';
import { UpdateBalanceDto } from './dto/update-balance.dto';
import { Balance } from './entities/balance.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FindByFieldDto } from './dto/find-by-field.dto';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { BalanceResponseDto } from './dto/balance-response.dto';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { BalanceException } from './balance.exception';
import { BalanceValidation } from './balance.validation';
@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(Balance)
    private balanceRepository: Repository<Balance>,
    @InjectMapper()
    private mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  async findOneByField(payload: FindByFieldDto) {
    const context = `${BalanceService.name}.${this.findOneByField.name}`;
    this.logger.debug(
      `Finding balance by field: ${JSON.stringify(payload)}`,
      context,
    );

    const where: FindOptionsWhere<Balance> = {};
    if (payload.slug) where.slug = payload.slug;
    if (payload.userSlug) where.user = { slug: payload.userSlug };

    const balance = await this.balanceRepository.findOne({ where: where });
    if (!balance)
      throw new BalanceException(BalanceValidation.BALANCE_NOT_FOUND);

    return this.mapper.map(balance, Balance, BalanceResponseDto);
  }

  update(id: number, updateBalanceDto: UpdateBalanceDto) {
    return this.balanceRepository.update(id, updateBalanceDto);
  }
}
