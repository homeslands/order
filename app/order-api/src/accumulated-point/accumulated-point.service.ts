import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOptionsWhere,
  Repository,
  Between,
  Not,
  In,
} from 'typeorm';
import { AccumulatedPoint } from './entities/accumulated-point.entity';
import { AccumulatedPointTransactionHistory } from './entities/accumulated-point-transaction-history.entity';
import {
  AccumulatedPointTransactionType,
  AccumulatedPointTransactionStatus,
} from './accumulated-point.constants';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import {
  AccumulatedPointResponseDto,
  IAddPointsDto,
  GetPointHistoryQueryDto,
  PointTransactionHistoryResponseDto,
  ApplyPointsResponseDto,
} from './accumulated-point.dto';
import { AppPaginatedResponseDto } from 'src/app/app.dto';
import { AccumulatedPointException } from './accumulated-point.exception';
import { AccumulatedPointValidation } from './accumulated-point.validation';
import {
  calculateAccumulatedPoints,
  isDefaultCustomer,
  validatePointsUsage,
} from './accumulated-point.utils';
import { User } from 'src/user/user.entity';
import { Order } from 'src/order/order.entity';
import { ConfigService } from '@nestjs/config';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { SystemConfigKey } from 'src/system-config/system-config.constant';
import { OrderStatus } from 'src/order/order.constants';

@Injectable()
export class AccumulatedPointService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(AccumulatedPoint)
    private readonly accumulatedPointRepository: Repository<AccumulatedPoint>,
    @InjectRepository(AccumulatedPointTransactionHistory)
    private readonly transactionHistoryRepository: Repository<AccumulatedPointTransactionHistory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectMapper()
    private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly systemConfigService: SystemConfigService,
  ) {}

  async getAccumulatedPointsPercentage() {
    return (
      (await this.systemConfigService.get(
        SystemConfigKey.ACCUMULATED_POINTS_PERCENTAGE,
      )) || '0'
    );
  }

  /**
   * Get points history of user
   */
  async getPointsHistory(
    userSlug: string,
    query: GetPointHistoryQueryDto,
  ): Promise<AppPaginatedResponseDto<PointTransactionHistoryResponseDto>> {
    const context = `${AccumulatedPointService.name}.${this.getPointsHistory.name}`;

    const user = await this.userRepository.findOne({
      where: { slug: userSlug },
      relations: ['accumulatedPoint'],
    });

    if (!user) {
      this.logger.error(`User not found: ${userSlug}`, context);
      throw new AccumulatedPointException(
        AccumulatedPointValidation.USER_NOT_FOUND,
      );
    }

    // Check if user is default customer
    if (isDefaultCustomer(user.phonenumber)) {
      this.logger.warn(
        `Default customer cannot view points history: ${userSlug}`,
        context,
      );
      throw new AccumulatedPointException(
        AccumulatedPointValidation.DEFAULT_CUSTOMER_NOT_ELIGIBLE,
      );
    }

    if (!user.accumulatedPoint) {
      return {
        hasNext: false,
        hasPrevios: false,
        items: [],
        total: 0,
        page: query.hasPaging ? query.page : 1,
        pageSize: query.hasPaging ? query.size : 0,
        totalPages: 0,
      } as AppPaginatedResponseDto<PointTransactionHistoryResponseDto>;
    }

    // Construct where options
    const whereOptions: FindOptionsWhere<AccumulatedPointTransactionHistory> = {
      accumulatedPoint: {
        id: user.accumulatedPoint.id,
      },
      type: In([query.types]),
    };

    if (query.fromDate && query.toDate) {
      whereOptions.createdAt = Between(
        new Date(query.fromDate),
        new Date(query.toDate),
      );
    } else if (query.fromDate) {
      whereOptions.createdAt = Between(new Date(query.fromDate), new Date());
    } else if (query.toDate) {
      whereOptions.createdAt = Between(
        new Date('1970-01-01'),
        new Date(query.toDate),
      );
    }

    // Construct find many options
    const findManyOptions: FindManyOptions = {
      relations: ['order'],
      where: whereOptions,
      order: { date: 'DESC' },
    };

    if (query.hasPaging) {
      findManyOptions.skip = (query.page - 1) * query.size;
      findManyOptions.take = query.size;
    }

    const [transactions, total] =
      await this.transactionHistoryRepository.findAndCount(findManyOptions);

    // Calculate total pages
    const page = query.hasPaging ? query.page : 1;
    const pageSize = query.hasPaging ? query.size : total;
    const totalPages = Math.ceil(total / pageSize);

    // Determine hasNext and hasPrevious
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    // Map to response DTOs
    const items = transactions.map((transaction) => ({
      ...this.mapper.map(
        transaction,
        AccumulatedPointTransactionHistory,
        PointTransactionHistoryResponseDto,
      ),
      orderSlug: transaction.order?.slug,
    }));

    return {
      hasNext,
      hasPrevios: hasPrevious,
      items,
      total,
      page,
      pageSize,
      totalPages,
    } as AppPaginatedResponseDto<PointTransactionHistoryResponseDto>;
  }

  /**
   * Get total points of user
   */
  async getTotalPointsByUserSlug(
    userSlug: string,
  ): Promise<AccumulatedPointResponseDto> {
    const context = `${AccumulatedPointService.name}.${this.getTotalPointsByUserSlug.name}`;

    const user = await this.userRepository.findOne({
      where: { slug: userSlug },
      relations: ['accumulatedPoint'],
    });

    if (!user) {
      this.logger.error(`User not found: ${userSlug}`, context);
      throw new AccumulatedPointException(
        AccumulatedPointValidation.USER_NOT_FOUND,
      );
    }

    // Check if user is default customer
    if (isDefaultCustomer(user.phonenumber)) {
      this.logger.warn(
        `Default customer cannot accumulate points: ${userSlug}`,
        context,
      );
      throw new AccumulatedPointException(
        AccumulatedPointValidation.DEFAULT_CUSTOMER_NOT_ELIGIBLE,
      );
    }

    let accumulatedPoint = user.accumulatedPoint;

    // Create new if not exists
    if (!accumulatedPoint) {
      accumulatedPoint = await this.createAccumulatedPointForUser(user);
    }

    return this.mapper.map(
      accumulatedPoint,
      AccumulatedPoint,
      AccumulatedPointResponseDto,
    );
  }

  /**
   * Add points for user after successful payment
   */
  async addPointsForOrder(addPointsDto: IAddPointsDto): Promise<void> {
    const context = `${AccumulatedPointService.name}.${this.addPointsForOrder.name}`;

    const user = await this.userRepository.findOne({
      where: { id: addPointsDto.userId },
      relations: ['accumulatedPoint'],
    });

    if (!user) {
      this.logger.error(`User not found: ${addPointsDto.userId}`, context);
      throw new AccumulatedPointException(
        AccumulatedPointValidation.USER_NOT_FOUND,
      );
    }

    // Check if user is default customer
    if (isDefaultCustomer(user.phonenumber)) {
      this.logger.log(
        `Default customer skipped for points accumulation: ${addPointsDto.userId}`,
        context,
      );
      return; // Don't add points for default customer
    }

    const pointsPercentage = await this.getAccumulatedPointsPercentage();

    const pointsToAdd = calculateAccumulatedPoints(
      addPointsDto.orderTotal,
      parseInt(pointsPercentage),
    );

    if (pointsToAdd <= 0) {
      this.logger.log(
        `No points to add for order: ${addPointsDto.orderId}`,
        context,
      );
      return;
    }

    let accumulatedPoint = user.accumulatedPoint;

    // Create new if not exists
    if (!accumulatedPoint) {
      accumulatedPoint = await this.createAccumulatedPointForUser(user);
    }

    const previousPoints = accumulatedPoint.totalPoints;
    accumulatedPoint.totalPoints += pointsToAdd;

    try {
      await this.accumulatedPointRepository.save(accumulatedPoint);

      // Create transaction history
      await this.createTransactionHistory({
        accumulatedPoint,
        orderId: addPointsDto.orderId,
        type: AccumulatedPointTransactionType.ADD,
        points: pointsToAdd,
        lastPoints: accumulatedPoint.totalPoints,
        status: AccumulatedPointTransactionStatus.CONFIRMED,
        createdUserId: null,
      });

      this.logger.log(
        `Added ${pointsToAdd} points for user ${user.id}, order ${addPointsDto.orderId}. Previous: ${previousPoints}, Current: ${accumulatedPoint.totalPoints}`,
        context,
      );
    } catch (error) {
      this.logger.error(
        `Error adding points: ${error.message}`,
        error.stack,
        context,
      );
      throw new AccumulatedPointException(
        AccumulatedPointValidation.ERROR_UPDATING_POINTS,
      );
    }
  }

  /**
   * Reserve points when apply for order (not actually subtract points)
   */
  async reservePointsForOrder(
    orderSlug: string,
    pointsToUse: number,
    createdUserId: string,
  ): Promise<ApplyPointsResponseDto> {
    const context = `${AccumulatedPointService.name}.${this.reservePointsForOrder.name}`;

    const createdUser = await this.userRepository.findOne({
      where: { id: createdUserId },
    });

    if (!createdUser) {
      this.logger.error(
        `Created user for apply accumulated points not found: ${createdUserId}`,
        context,
      );
      throw new AccumulatedPointException(
        AccumulatedPointValidation.USER_NOT_FOUND,
      );
    }

    const order = await this.orderRepository.findOne({
      where: { slug: orderSlug },
      relations: ['owner.accumulatedPoint'],
    });

    if (!order) {
      this.logger.error(`Order not found: ${orderSlug}`, context);
      throw new AccumulatedPointException(
        AccumulatedPointValidation.ORDER_NOT_FOUND,
      );
    }

    if (order.status !== OrderStatus.PENDING) {
      this.logger.error(`Order is not pending: ${orderSlug}`, context);
      throw new AccumulatedPointException(
        AccumulatedPointValidation.ORDER_STATUS_INVALID,
      );
    }

    const user = order.owner;
    if (!user) {
      this.logger.error(`Order owner not found: ${orderSlug}`, context);
      throw new AccumulatedPointException(
        AccumulatedPointValidation.ORDER_OWNER_NOT_FOUND,
      );
    }

    // Check if user is default customer
    if (isDefaultCustomer(user.phonenumber)) {
      this.logger.warn(
        `Default customer cannot use points: ${orderSlug}`,
        context,
      );
      throw new AccumulatedPointException(
        AccumulatedPointValidation.DEFAULT_CUSTOMER_NOT_ELIGIBLE,
      );
    }

    let accumulatedPoint = user.accumulatedPoint;

    // Create new if not exists
    if (!accumulatedPoint) {
      accumulatedPoint = await this.createAccumulatedPointForUser(user);
    }

    // Check if there is reservation for other order
    // 1 order can reserve multiple times
    // If reservation exists, create new reservation then the old one will be deleted
    // User cannot create 2 orders and reserve at the same time
    const existingReservationForOtherOrder =
      await this.transactionHistoryRepository.findOne({
        where: {
          order: { id: Not(order.id) },
          accumulatedPoint: { id: accumulatedPoint.id },
          type: AccumulatedPointTransactionType.RESERVE,
          status: AccumulatedPointTransactionStatus.PENDING,
        },
        relations: ['order'],
      });

    if (existingReservationForOtherOrder) {
      this.logger.warn(
        `Points already reserved for other order: ${existingReservationForOtherOrder.order.slug}`,
        context,
      );
      throw new AccumulatedPointException(
        AccumulatedPointValidation.POINTS_ALREADY_RESERVED_FOR_OTHER_ORDER,
      );
    }

    let oldPointsToUse = 0;

    const existingReservationForThisOrder =
      await this.transactionHistoryRepository.findOne({
        where: {
          order: { id: order.id },
          accumulatedPoint: { id: accumulatedPoint.id },
          type: AccumulatedPointTransactionType.RESERVE,
          status: AccumulatedPointTransactionStatus.PENDING,
        },
        relations: ['order'],
      });

    if (existingReservationForThisOrder) {
      //get old points to use
      oldPointsToUse = existingReservationForThisOrder.points;
    }

    // Validate points usage
    const validation = validatePointsUsage(
      pointsToUse,
      //add old points if existing pending reservation for this order
      accumulatedPoint.totalPoints + oldPointsToUse,
      order.subtotal + oldPointsToUse,
    );
    if (!validation.isValid) {
      this.logger.warn(`Invalid points usage: ${validation.error}`, context);
      throw new AccumulatedPointException(
        AccumulatedPointValidation.INVALID_POINTS_AMOUNT,
      );
    }

    if (existingReservationForThisOrder) {
      //soft delete existing reservation for this order
      existingReservationForThisOrder.status =
        AccumulatedPointTransactionStatus.CANCELLED;
      await this.transactionHistoryRepository.save(
        existingReservationForThisOrder,
      );
    }

    try {
      await this.createTransactionHistory({
        accumulatedPoint,
        orderId: order.id,
        type: AccumulatedPointTransactionType.RESERVE,
        points: pointsToUse,
        lastPoints: accumulatedPoint.totalPoints + oldPointsToUse - pointsToUse,
        status: AccumulatedPointTransactionStatus.PENDING,
        createdUserId,
      });

      // Update accumulated point
      accumulatedPoint.totalPoints =
        accumulatedPoint.totalPoints + oldPointsToUse - pointsToUse;
      await this.accumulatedPointRepository.save(accumulatedPoint);

      const finalAmount = order.subtotal + oldPointsToUse - pointsToUse;

      order.accumulatedPointsToUse = pointsToUse;
      order.subtotal = finalAmount;
      await this.orderRepository.save(order);

      this.logger.log(
        `Reserved ${pointsToUse} points for user ${user.id}, order ${orderSlug}. Current points: ${accumulatedPoint.totalPoints}`,
        context,
      );

      return {
        pointsUsed: pointsToUse,
        finalAmount,
      };
    } catch (error) {
      this.logger.error(
        `Error reserving points: ${error.message}`,
        error.stack,
        context,
      );
      throw new AccumulatedPointException(
        AccumulatedPointValidation.ERROR_CREATING_TRANSACTION_HISTORY,
      );
    }
  }

  /**
   * Confirm points usage when order is paid successfully
   */
  async confirmPointsUsage(orderId: string): Promise<void> {
    const context = `${AccumulatedPointService.name}.${this.confirmPointsUsage.name}`;

    // Find reservation pending for this order
    const reservation = await this.transactionHistoryRepository.findOne({
      where: {
        order: { id: orderId },
        type: AccumulatedPointTransactionType.RESERVE,
        status: AccumulatedPointTransactionStatus.PENDING,
      },
      relations: ['accumulatedPoint'],
    });

    if (!reservation) {
      this.logger.log(`No reserved points found for order ${orderId}`, context);
      return; // No points to reserve, skip
    }

    const accumulatedPoint = reservation.accumulatedPoint;
    const pointsToUse = reservation.points;

    try {
      // Update reservation status to confirmed
      reservation.status = AccumulatedPointTransactionStatus.CONFIRMED;
      reservation.lastPoints = reservation.lastPoints;
      await this.transactionHistoryRepository.save(reservation);

      // Create record USE to tracking
      await this.createTransactionHistory({
        accumulatedPoint,
        orderId,
        type: AccumulatedPointTransactionType.USE,
        points: pointsToUse,
        lastPoints: reservation.lastPoints,
        status: AccumulatedPointTransactionStatus.CONFIRMED,
        createdUserId: null,
      });

      this.logger.log(
        `Confirmed ${pointsToUse} points usage for order ${orderId}. New balance: ${accumulatedPoint.totalPoints}`,
        context,
      );
    } catch (error) {
      this.logger.error(
        `Error confirming points usage: ${error.message}`,
        error.stack,
        context,
      );
      throw new AccumulatedPointException(
        AccumulatedPointValidation.ERROR_UPDATING_POINTS,
      );
    }
  }

  /**
   * Automatically handle when order is cancelled or expired
   * Cancel reservation if exists, refund points if confirmed
   */
  async handleCancelReservation(orderId: string): Promise<void> {
    const context = `${AccumulatedPointService.name}.${this.handleCancelReservation.name}`;

    const reservation = await this.transactionHistoryRepository.findOne({
      where: {
        order: { id: orderId },
        type: AccumulatedPointTransactionType.RESERVE,
        status: AccumulatedPointTransactionStatus.PENDING,
      },
      relations: ['accumulatedPoint.user'],
    });

    if (!reservation) {
      this.logger.log(`No reserved points found for order ${orderId}`, context);
      return; // No points to reserve, skip
    }
    if (!reservation.accumulatedPoint) {
      this.logger.log(
        `No accumulated point found for order ${orderId}`,
        context,
      );
      return; // No points to reserve, skip
    }
    if (!reservation.accumulatedPoint.user) {
      this.logger.log(
        `No user found for accumulated point ${orderId}`,
        context,
      );
      return; // No points to reserve, skip
    }

    if (isDefaultCustomer(reservation.accumulatedPoint.user.phonenumber)) {
      this.logger.log(
        `Default customer cannot use points: ${orderId}`,
        context,
      );
      return; // No points to reserve, skip
    }

    // Refund points used
    const accumulatedPoint = reservation.accumulatedPoint;
    accumulatedPoint.totalPoints += reservation.points;

    await this.accumulatedPointRepository.save(accumulatedPoint);

    // cancel reservation
    reservation.status = AccumulatedPointTransactionStatus.CANCELLED;
    await this.transactionHistoryRepository.save(reservation);

    // Create refund transaction history
    await this.createTransactionHistory({
      accumulatedPoint,
      orderId,
      type: AccumulatedPointTransactionType.REFUND,
      points: reservation.points,
      lastPoints: accumulatedPoint.totalPoints,
      status: AccumulatedPointTransactionStatus.CONFIRMED,
      createdUserId: null,
    });

    this.logger.log(
      `Refunded ${reservation.points} confirmed points for cancelled/expired order ${orderId}`,
      context,
    );
  }

  /**
   * Create new accumulated point account for user
   */
  private async createAccumulatedPointForUser(
    user: User,
  ): Promise<AccumulatedPoint> {
    const context = `${AccumulatedPointService.name}.${this.createAccumulatedPointForUser.name}`;

    try {
      const accumulatedPoint = this.accumulatedPointRepository.create({
        user,
        totalPoints: 0,
      });

      const savedPoint =
        await this.accumulatedPointRepository.save(accumulatedPoint);
      this.logger.log(
        `Created accumulated point account for user ${user.id}`,
        context,
      );

      return savedPoint;
    } catch (error) {
      this.logger.error(
        `Error creating accumulated point account: ${error.message}`,
        error.stack,
        context,
      );
      throw new AccumulatedPointException(
        AccumulatedPointValidation.ERROR_CREATING_ACCUMULATED_POINT,
      );
    }
  }

  /**
   * Create transaction history
   */
  private async createTransactionHistory(data: {
    accumulatedPoint: AccumulatedPoint;
    orderId: string;
    type: AccumulatedPointTransactionType;
    points: number;
    lastPoints: number;
    status: AccumulatedPointTransactionStatus;
    createdUserId: string | null;
  }): Promise<void> {
    const context = `${AccumulatedPointService.name}.${this.createTransactionHistory.name}`;

    try {
      const order = await this.orderRepository.findOne({
        where: { id: data.orderId },
      });

      const pointsPercentage = await this.getAccumulatedPointsPercentage();

      const transaction = this.transactionHistoryRepository.create({
        accumulatedPoint: data.accumulatedPoint,
        order,
        type: data.type,
        points: data.points,
        lastPoints: data.lastPoints,
        currentPointsPercentage: parseInt(pointsPercentage),
        date: new Date(),
        status: data.status,
        createdBy: data.createdUserId,
      });

      await this.transactionHistoryRepository.save(transaction);
      this.logger.log(
        `Created transaction history: ${data.type} ${data.points} points`,
        context,
      );
    } catch (error) {
      this.logger.error(
        `Error creating transaction history: ${error.message}`,
        error.stack,
        context,
      );
      throw new AccumulatedPointException(
        AccumulatedPointValidation.ERROR_CREATING_TRANSACTION_HISTORY,
      );
    }
  }
}
