import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  ToggleCoinPolicyActivationDto,
  UpdateCoinPolicyDto,
} from './dto/update-coin-policy.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CoinPolicy } from './entities/coin-policy.entity';
import { IsNull, Repository } from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Mapper } from '@automapper/core';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { CoinPolicyResponseDto } from './dto/coin-policy-response.dto';
import { CoinPolicyException } from './coin-policy.exception';
import { CoinPolicyValidation } from './coin-policy.validation';
import { CoinPolicyKeyEnum } from './coin-policy.enum';
import { CoinPolicyConstanst } from './coin-policy.constants';

@Injectable()
export class CoinPolicyService {
  constructor(
    @InjectRepository(CoinPolicy)
    private readonly coinPolicyRepository: Repository<CoinPolicy>,
    @InjectMapper()
    private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly transactionService: TransactionManagerService,
  ) {}

  async toggleActivation(
    slug: string,
    toggleCoinPolicyActivationDto: ToggleCoinPolicyActivationDto,
  ) {
    const policy = await this.coinPolicyRepository.findOne({
      where: {
        slug: slug || IsNull(),
      },
    });
    if (!policy)
      throw new CoinPolicyException(CoinPolicyValidation.COIN_POLICY_NOT_FOUND);
    policy.isActive = toggleCoinPolicyActivationDto.isActive;
    await this.coinPolicyRepository.save(policy);
  }

  async findAll(): Promise<CoinPolicyResponseDto[]> {
    const result = await this.coinPolicyRepository.find({});
    return this.mapper.mapArray(result, CoinPolicy, CoinPolicyResponseDto);
  }

  async update(
    slug: string,
    updateCoinPolicyDto: UpdateCoinPolicyDto,
  ): Promise<void> {
    const policy = await this.coinPolicyRepository.findOne({
      where: {
        slug: slug || IsNull(),
      },
    });
    if (!policy)
      throw new CoinPolicyException(CoinPolicyValidation.COIN_POLICY_NOT_FOUND);

    this.validateValue(policy.key, updateCoinPolicyDto.value);

    policy.value = updateCoinPolicyDto.value;

    await this.coinPolicyRepository.save(policy);
  }

  private validateValue(key: string, valueStr: string) {
    switch (key) {
      case CoinPolicyKeyEnum.MAX_BALANCE:
        const value = +valueStr;
        if (isNaN(value)) {
          throw new CoinPolicyException(
            CoinPolicyValidation.COIN_POLICY_VALUE_TYPE_MUST_BE_INTEGER,
          );
        }
        if (value < CoinPolicyConstanst.DEFAULT_MAX_BALANCE_VALUE) {
          throw new CoinPolicyException(
            CoinPolicyValidation.VALUE_MUST_BE_GREATER_THAN_OR_EQUAL_TO_DEFAULT_VALUE,
          );
        }
        break;
      default:
        throw new CoinPolicyException(
          CoinPolicyValidation.COIN_POLICY_VALUE_TYPE_IS_NOT_VALID,
        );
    }
  }
}
