import { Inject, Injectable, Logger } from '@nestjs/common';
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
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { User } from 'src/user/user.entity';
import { AuthException } from 'src/auth/auth.exception';
import { AuthValidation } from 'src/auth/auth.validation';

@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(Balance)
    private balanceRepository: Repository<Balance>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectMapper()
    private mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private transactionService: TransactionManagerService,
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

  async create(payload: { userSlug: string }) {
    const context = `${BalanceService.name}.${this.create.name}`;
    this.logger.log(
      `Creating balance req: ${JSON.stringify(payload)}`,
      context,
    );

    const user = await this.userRepository.findOne({
      where: { slug: payload.userSlug },
    });
    if (!user) throw new AuthException(AuthValidation.USER_NOT_FOUND);

    const balance = new Balance();

    Object.assign(balance, {
      user: user,
    } as Partial<Balance>);
    return await this.transactionService.execute<Balance>(
      async (manager) => {
        return await manager.save(balance);
      },
      () => this.logger.log(`Balance ${balance.slug} created`, context),
      (error) =>
        this.logger.log(
          `Error when creating balance: ${error.message}`,
          error.stack,
          context,
        ),
    );
  }

  async calcBalance(payload: {
    userSlug: string;
    points: number;
    type: string;
  }) {
    const context = `${BalanceService.name}.${this.calcBalance.name}`;
    this.logger.log(`Calc balance req: ${JSON.stringify(payload)}`, context);

    let balance = await this.balanceRepository.findOne({
      where: {
        user: {
          slug: payload.userSlug,
        },
      },
    });
    if (!balance) {
      balance = await this.create({ userSlug: payload.userSlug });
    }

    const points = Math.abs(payload.points);
    balance.points = Number(balance.points);

    switch (payload.type) {
      case 'in':
        balance.points += points;
        break;
      case 'out':
        // Throw exceptions
        balance.points -= points;
        break;
      default:
        break;
    }
    await this.transactionService.execute<Balance>(
      async (manager) => {
        return await manager.save(balance);
      },
      (result) => {
        this.logger.log(`${JSON.stringify(result)}`, context);
      },
      (error) => {
        this.logger.error(
          `Error when calc balance: ${error.message}`,
          error.stack,
          context,
        );
      },
    );
  }
}
