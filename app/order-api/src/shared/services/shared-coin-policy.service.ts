import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Mapper } from '@automapper/core';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { CoinPolicy } from 'src/gift-card-modules/coin-policy/entities/coin-policy.entity';
import { CoinPolicyKeyEnum } from 'src/gift-card-modules/coin-policy/coin-policy.enum';
import { IsMaxBalancePayload } from '../interfaces/commons/shared-coin-policy.interface';
import { SharedBalanceService } from './shared-balance.service';

@Injectable()
export class SharedCoinPolicyService {
  constructor(
    @InjectRepository(CoinPolicy)
    private readonly coinPolicyRepository: Repository<CoinPolicy>,
    @InjectMapper()
    private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly transactionService: TransactionManagerService,
    private readonly balanceService: SharedBalanceService,
  ) { }

  async isExceedBalance(payload: IsMaxBalancePayload) {
    const policy = await this.coinPolicyRepository.findOne({
      where: {
        key: CoinPolicyKeyEnum.MAX_BALANCE,
      },
    });
    if (!policy?.isActive) return false;

    const balance = await this.balanceService.findOneByField({
      userSlug: payload.userSlug,
      slug: null,
    });
    const newBalance = +balance.points + payload.totalPoints;
    const maxBalance = +policy.value;
    return newBalance > maxBalance;
  }
}
