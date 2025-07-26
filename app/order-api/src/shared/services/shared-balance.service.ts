import { Inject, Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { Balance } from 'src/gift-card-modules/balance/entities/balance.entity';
import { BalanceException } from 'src/gift-card-modules/balance/balance.exception';
import { BalanceValidation } from 'src/gift-card-modules/balance/balance.validation';
import { User } from 'src/user/user.entity';
import { AuthException } from 'src/auth/auth.exception';
import { AuthValidation } from 'src/auth/auth.validation';

@Injectable()
export class SharedBalanceService {
  constructor(
    @InjectRepository(Balance)
    private balanceRepository: Repository<Balance>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private transactionService: TransactionManagerService,
  ) {}

  async create(payload: { userSlug: string }) {
    const context = `${SharedBalanceService.name}.${this.create.name}`;
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

  async validate(payload: { userSlug: string; points: number }) {
    const context = `${SharedBalanceService.name}.${this.validate.name}`;
    this.logger.log(
      `Validate balance req: ${JSON.stringify(payload)}`,
      context,
    );

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

    const newPointsValue = balance.points - payload.points;

    if (newPointsValue < 0) {
      throw new BalanceException(BalanceValidation.INSUFFICIENT_BALANCE);
    }

    return true;
  }

  async calcBalance(payload: {
    userSlug: string;
    points: number;
    type: 'in' | 'out';
  }) {
    const context = `${SharedBalanceService.name}.${this.calcBalance.name}`;
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
