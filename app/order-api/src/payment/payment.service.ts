import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { IsNull, Repository } from 'typeorm';
import { CashStrategy } from './strategy/cash.strategy';
import { BankTransferStrategy } from './strategy/bank-transfer.strategy';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import {
  CreatePaymentDto,
  GetSpecificPaymentRequestDto,
  PaymentResponseDto,
} from './payment.dto';
import { Order } from 'src/order/order.entity';
import { v4 as uuidv4 } from 'uuid';
import * as _ from 'lodash';
import { PaymentException } from './payment.exception';
import { PaymentValidation } from './payment.validation';
import {
  PaymentAction,
  PaymentMethod,
  PaymentStatus,
} from './payment.constants';
import {
  ACBResponseDto,
  ACBStatusRequestDto,
} from 'src/acb-connector/acb-connector.dto';
import { formatMoment } from 'src/helper';
import {
  ACBConnectorStatus,
  ACBConnectorTransactionStatus,
} from 'src/acb-connector/acb-connector.constants';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderException } from 'src/order/order.exception';
import { OrderValidation } from 'src/order/order.validation';
import { OrderStatus } from 'src/order/order.constants';
import { PdfService } from 'src/pdf/pdf.service';
import { RoleEnum } from 'src/role/role.enum';
import { UserUtils } from 'src/user/user.utils';
import { CurrentUserDto } from 'src/user/user.dto';
import { PaymentUtils } from './payment.utils';
import { TransactionManagerService } from 'src/db/transaction-manager.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectMapper() private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly cashStrategy: CashStrategy,
    private readonly bankTransferStrategy: BankTransferStrategy,
    private readonly eventEmitter: EventEmitter2,
    private readonly pdfService: PdfService,
    private readonly userUtils: UserUtils,
    private readonly paymentUtils: PaymentUtils,
    private readonly transactionService: TransactionManagerService,
  ) {}

  async getAll() {
    const payments = await this.paymentRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
    return this.mapper.mapArray(payments, Payment, PaymentResponseDto);
  }

  async update(slug: string) {
    const context = `${PaymentService.name}.${this.update.name}`;
    this.logger.log(`Update payment: ${slug}`, context);

    const payment = await this.paymentRepository.findOne({
      where: {
        slug: slug ?? IsNull(),
      },
      relations: ['cardOrder'],
    });

    if (!payment)
      throw new PaymentException(PaymentValidation.PAYMENT_NOT_FOUND);

    payment.statusCode = PaymentStatus.COMPLETED;
    payment.message = 'Thanh toan thanh cong';

    await this.transactionService.execute<Payment>(
      async (manager) => {
        const updated = await manager.save(payment);
        if (updated.cardOrder) {
          this.eventEmitter.emit(PaymentAction.CARD_ORDER_PAYMENT_PAID, {
            orderSlug: updated.cardOrder?.slug,
          });
        }
        return updated;
      },
      (res) => {
        this.logger.log(`Payment ${res.slug} updated`, context);
      },
      (error) => {
        this.logger.error(
          `Error when updating payment: ${error.message}`,
          error.stack,
          context,
        );
        throw new PaymentException(PaymentValidation.ERROR_WHEN_UPDATE_PAYEMNT);
      },
    );
  }

  async exportPayment(slug: string) {
    const context = `${PaymentService.name}.${this.exportPayment.name}`;
    const payment = await this.paymentRepository.findOne({
      where: {
        slug,
      },
      relations: ['order'],
    });
    if (!payment) {
      this.logger.warn(`Payment ${slug} not found`, context);
      throw new PaymentException(PaymentValidation.PAYMENT_NOT_FOUND);
    }

    if (payment.paymentMethod !== PaymentMethod.BANK_TRANSFER) {
      this.logger.warn(`Payment ${slug} is not a bank transfer`, context);
      throw new PaymentException(
        PaymentValidation.ONLY_BANK_TRANSFER_CAN_EXPORT,
      );
    }

    const data = await this.pdfService.generatePdf('payment', payment, {
      width: '80mm',
    });

    this.logger.log(`Payment ${payment.slug} exported`, context);

    return data;
  }

  /**
   * Get specific payment
   * @param {GetSpecificPaymentRequestDto} query
   * @returns {Promise<PaymentResponseDto>} payment
   */
  async getSpecific(
    query: GetSpecificPaymentRequestDto,
  ): Promise<PaymentResponseDto> {
    if (_.isEmpty(query)) {
      throw new PaymentException(PaymentValidation.PAYMENT_QUERY_INVALID);
    }
    const payment = await this.paymentRepository.findOne({
      where: { transactionId: query.transaction },
    });
    return this.mapper.map(payment, Payment, PaymentResponseDto);
  }

  /**
   * Initiate payment
   * @param {CreatePaymentDto} createPaymentDto
   * @returns {Promise<PaymentResponseDto>} payment
   */
  async initiate(
    createPaymentDto: CreatePaymentDto,
    currentUser: CurrentUserDto,
  ): Promise<PaymentResponseDto> {
    const context = `${PaymentService.name}.${this.initiate.name}`;

    // created by
    const user = await this.userUtils.getUser({
      where: { id: currentUser.userId ?? IsNull() },
      relations: ['role'],
    });
    // get order
    const order = await this.orderRepository.findOne({
      where: { slug: createPaymentDto.orderSlug },
      relations: ['owner', 'payment'],
    });

    // if order subtotal is less than 2000,
    // set loss === subtotal
    // set subtotal === 0
    // set payment method === CASH

    this.logger.log(
      `Initiate payment for order: ${JSON.stringify(order)}`,
      context,
    );
    if (!order) {
      this.logger.error('Order not found', null, context);
      throw new OrderException(OrderValidation.ORDER_NOT_FOUND);
    }

    if (order.payment) {
      if (
        order.payment.paymentMethod === PaymentMethod.BANK_TRANSFER &&
        createPaymentDto.paymentMethod === PaymentMethod.BANK_TRANSFER &&
        order.subtotal === order.payment.amount
      ) {
        this.logger.warn(
          `Order ${order.slug} already has a payment`,
          null,
          context,
        );
        throw new PaymentException(PaymentValidation.ORDER_ALREADY_HAS_PAYMENT);
      }
    }

    if (order.status !== OrderStatus.PENDING) {
      this.logger.error('Order is not pending', null, context);
      throw new OrderException(
        OrderValidation.ORDER_STATUS_INVALID,
        'Order is not pending',
      );
    }

    let payment: Payment;

    if (user.role?.name === RoleEnum.Customer) {
      switch (createPaymentDto.paymentMethod) {
        case PaymentMethod.BANK_TRANSFER:
          if (order.subtotal < 2000) {
            order.loss = order.subtotal;
            order.subtotal = 0;
            createPaymentDto.paymentMethod = PaymentMethod.CASH;
            payment = await this.cashStrategy.process(order);
            break;
          }
          payment = await this.bankTransferStrategy.process(order);
          break;
        default:
          this.logger.error('Customer only use bank transfer', null, context);
          throw new PaymentException(
            PaymentValidation.CUSTOMER_ONLY_USE_BANK_TRANSFER,
          );
      }
    } else if (
      user.role?.name === RoleEnum.Staff ||
      user.role?.name === RoleEnum.Manager ||
      user.role?.name === RoleEnum.Admin ||
      user.role?.name === RoleEnum.SuperAdmin
    ) {
      switch (createPaymentDto.paymentMethod) {
        case PaymentMethod.BANK_TRANSFER:
          if (order.subtotal < 2000) {
            order.loss = order.subtotal;
            order.subtotal = 0;
            createPaymentDto.paymentMethod = PaymentMethod.CASH;
            payment = await this.cashStrategy.process(order);
            break;
          }
          payment = await this.bankTransferStrategy.process(order);
          break;
        case PaymentMethod.CASH:
          if (order.subtotal < 2000) {
            order.loss = order.subtotal;
            order.subtotal = 0;
          }
          payment = await this.cashStrategy.process(order);
          break;
        default:
          this.logger.error('Invalid payment method', null, context);
          throw new PaymentException(PaymentValidation.PAYMENT_METHOD_INVALID);
      }
    } else {
      this.logger.error('Role not allowed to initiate payment', null, context);
      throw new PaymentException(
        PaymentValidation.ROLE_NOT_ALLOWED_TO_INITIATE_PAYMENT,
      );
    }

    this.logger.log(`Created Payment: ${JSON.stringify(payment)}`, context);

    // Delete previous payment
    if (order.payment) {
      // await this.paymentRepository.softRemove(order.payment);
      await this.paymentUtils.cancelPayment(order.payment.slug);
    }

    // Update order
    order.payment = payment;
    await this.orderRepository.save(order);

    if (payment.paymentMethod === PaymentMethod.CASH) {
      // Update order status
      this.eventEmitter.emit(PaymentAction.PAYMENT_PAID, { orderId: order.id });
    }
    return this.mapper.map(payment, Payment, PaymentResponseDto);
  }

  async initiatePublic(
    createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    const context = `${PaymentService.name}.${this.initiatePublic.name}`;
    // get order
    const order = await this.orderRepository.findOne({
      where: { slug: createPaymentDto.orderSlug },
      relations: ['owner', 'payment'],
    });
    if (!order) {
      this.logger.error('Order not found', null, context);
      throw new OrderException(OrderValidation.ORDER_NOT_FOUND);
    }
    if (order.owner?.phonenumber !== 'default-customer') {
      this.logger.error('Initiate public payment denied', null, context);
      throw new PaymentException(
        PaymentValidation.INITIATE_PUBLIC_PAYMENT_DENIED,
      );
    }

    if (order.status !== OrderStatus.PENDING) {
      this.logger.error('Order is not pending', null, context);
      throw new OrderException(
        OrderValidation.ORDER_STATUS_INVALID,
        'Order is not pending',
      );
    }

    // if (order.payment) {
    //   this.logger.warn(
    //     `Order ${order.slug} already has a payment`,
    //     null,
    //     context,
    //   );
    //   throw new PaymentException(PaymentValidation.ORDER_ALREADY_HAS_PAYMENT);
    // }

    if (order.payment) {
      if (
        order.payment.paymentMethod === PaymentMethod.BANK_TRANSFER &&
        createPaymentDto.paymentMethod === PaymentMethod.BANK_TRANSFER &&
        order.subtotal === order.payment.amount
      ) {
        this.logger.warn(
          `Order ${order.slug} already has a payment`,
          null,
          context,
        );
        throw new PaymentException(PaymentValidation.ORDER_ALREADY_HAS_PAYMENT);
      }
    }

    let payment: Payment;

    switch (createPaymentDto.paymentMethod) {
      case PaymentMethod.BANK_TRANSFER:
        if (order.subtotal < 2000) {
          order.loss = order.subtotal;
          order.subtotal = 0;
          createPaymentDto.paymentMethod = PaymentMethod.CASH;
          payment = await this.cashStrategy.process(order);
          break;
        }
        payment = await this.bankTransferStrategy.process(order);
        break;
      default:
        this.logger.error('Invalid payment method', null, context);
        throw new PaymentException(PaymentValidation.PAYMENT_METHOD_INVALID);
    }
    this.logger.log(`Created Payment: ${JSON.stringify(payment)}`, context);

    // Delete previous payment
    if (order.payment) {
      await this.paymentUtils.cancelPayment(order.payment.slug);
    }

    // Update order
    order.payment = payment;
    await this.orderRepository.save(order);

    if (payment.paymentMethod === PaymentMethod.CASH) {
      // Update order status
      this.eventEmitter.emit(PaymentAction.PAYMENT_PAID, { orderId: order.id });
    }
    return this.mapper.map(payment, Payment, PaymentResponseDto);
  }

  /**
   * Callback update payment status
   * @param {CallbackUpdatePaymentStatusRequestDto} requestData
   * @returns {Promise<PaymentResponseDto>} payment
   * @throws {PaymentException}
   */
  async callback(requestData: ACBStatusRequestDto): Promise<ACBResponseDto> {
    const context = `${PaymentService.name}.${this.callback.name}`;
    // Get transaction from request data
    const transaction =
      requestData.requestParameters?.request?.requestParams?.transactions?.[0];
    if (!transaction) {
      this.logger.error('Transaction not found', null, context);
      throw new PaymentException(PaymentValidation.TRANSACTION_NOT_FOUND);
    }

    const payment = await this.paymentRepository.findOne({
      where: {
        transactionId: transaction.transactionEntityAttribute.traceNumber,
      },
      relations: ['order', 'cardOrder'],
    });

    this.logger.log(`Payment: ${JSON.stringify(payment)}`, context);

    if (!payment) {
      this.logger.error('Payment not found', null, context);
      throw new PaymentException(PaymentValidation.PAYMENT_NOT_FOUND);
    }

    const statusCode =
      transaction.transactionStatus === ACBConnectorTransactionStatus.COMPLETED
        ? PaymentStatus.COMPLETED
        : PaymentStatus.FAILED;

    Object.assign(payment, {
      statusCode: statusCode,
      statusMessage: statusCode,
    });

    const updatedPayment = await this.paymentRepository.save(payment);
    this.logger.log(`Payment ${updatedPayment.id}`, context);

    // Update order status
    if (payment.order)
      this.eventEmitter.emit(PaymentAction.PAYMENT_PAID, {
        orderId: payment.order?.id,
      });

    if (payment.cardOrder) {
      this.eventEmitter.emit(PaymentAction.CARD_ORDER_PAYMENT_PAID, {
        orderSlug: payment.cardOrder?.slug,
      });
    }

    // return data for acb
    const response = {
      requestTrace: uuidv4(),
      responseDateTime: formatMoment(),
      responseStatus: {
        responseCode:
          transaction?.transactionStatus ===
          ACBConnectorTransactionStatus.COMPLETED
            ? ACBConnectorStatus.SUCCESS
            : ACBConnectorStatus.BAD_REQUEST,
        responseMessage: transaction?.transactionStatus,
      },
      responseBody: {
        index: 1,
        referenceCode: payment.slug,
      },
    } as ACBResponseDto;
    this.logger.warn(`Callback response: ${JSON.stringify(response)}`, context);
    return response;
  }
}
