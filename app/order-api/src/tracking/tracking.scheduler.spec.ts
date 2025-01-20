import {
  MockType,
  repositoryMockFactory,
} from 'src/test-utils/repository-mock.factory';
import { TrackingScheduler } from './tracking.scheduler';
import { Repository } from 'typeorm';
import { Tracking } from './tracking.entity';
import { Order } from 'src/order/order.entity';
import { SchedulerRegistry } from '@nestjs/schedule';
import { RobotConnectorClient } from 'src/robot-connector/robot-connector.client';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { OrderItem } from 'src/order-item/order-item.entity';
import { TrackingOrderItem } from 'src/tracking-order-item/tracking-order-item.entity';
import { WorkflowStatus } from './tracking.constants';
import { OrderStatus } from 'src/order/order.contants';

describe('TrackingScheduler', () => {
  let trackingScheduler: TrackingScheduler;
  let trackingRepositoryMock: MockType<Repository<Tracking>>;
  let trackingOrderItemRepositoryMock: MockType<Repository<TrackingOrderItem>>;
  let orderRepositoryMock: MockType<Repository<Order>>;
  let orderItemRepositoryMock: MockType<Repository<OrderItem>>;
  let schedulerRegistryMock: SchedulerRegistry;
  let robotConnectorClientMock: RobotConnectorClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrackingScheduler,
        RobotConnectorClient,
        SchedulerRegistry,
        {
          provide: RobotConnectorClient,
          useValue: {
            getRobotById: jest.fn(),
            runWorkflow: jest.fn(),
          },
        },
        {
          provide: SchedulerRegistry,
          useValue: {
            getCronJob: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Tracking),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Order),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(TrackingOrderItem),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(OrderItem),
          useFactory: repositoryMockFactory,
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: console,
        },
      ],
    }).compile();

    trackingScheduler = module.get<TrackingScheduler>(TrackingScheduler);
    orderRepositoryMock = module.get(getRepositoryToken(Order));
    trackingRepositoryMock = module.get(getRepositoryToken(Tracking));
    orderItemRepositoryMock = module.get(getRepositoryToken(OrderItem));
    trackingOrderItemRepositoryMock = module.get(
      getRepositoryToken(TrackingOrderItem),
    );
    schedulerRegistryMock = module.get<SchedulerRegistry>(SchedulerRegistry);
    robotConnectorClientMock =
      module.get<RobotConnectorClient>(RobotConnectorClient);
  });

  it('should be defined', () => {
    expect(trackingScheduler).toBeDefined();
  });

  describe('calculateTotalQuantity - calculate quantity of completed and running', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return valid result', () => {
      const tracking1 = {
        workflowExecution: '',
        status: WorkflowStatus.COMPLETED,
      } as Tracking;
      const trackingOrderItem1 = {
        quantity: 1,
        tracking: tracking1,
      } as TrackingOrderItem;
      const tracking2 = {
        workflowExecution: '',
        status: WorkflowStatus.RUNNING,
      } as Tracking;
      const trackingOrderItem2 = {
        quantity: 2,
        tracking: tracking2,
      } as TrackingOrderItem;
      const orderItem = {
        quantity: 5,
        subtotal: 0,
        trackingOrderItems: [trackingOrderItem1, trackingOrderItem2],
      } as OrderItem;
      const mockInput = [orderItem, orderItem];
      const mockOutput = {
        [WorkflowStatus.COMPLETED]: 2,
        [WorkflowStatus.RUNNING]: 4,
      };
      const result = trackingScheduler.calculateTotalQuantity(mockInput);
      expect(result).toEqual(mockOutput);
    });
  });

  describe('updateStatusOrder', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should update status SHIPPING for order', async () => {
      const tracking1 = {
        workflowExecution: '',
        status: WorkflowStatus.COMPLETED,
      } as Tracking;
      const trackingOrderItem1 = {
        quantity: 1,
        tracking: tracking1,
      } as TrackingOrderItem;
      const tracking2 = {
        workflowExecution: '',
        status: WorkflowStatus.RUNNING,
      } as Tracking;
      const trackingOrderItem2 = {
        quantity: 2,
        tracking: tracking2,
      } as TrackingOrderItem;
      const orderItem1 = {
        quantity: 5,
        subtotal: 0,
        trackingOrderItems: [trackingOrderItem1],
      } as OrderItem;
      const orderItem2 = {
        quantity: 5,
        subtotal: 0,
        trackingOrderItems: [trackingOrderItem2],
      } as OrderItem;

      const order = {
        subtotal: 0,
        status: '',
        type: '',
        orderItems: [orderItem1, orderItem2],
      } as Order;

      const orders = [order];

      const mockOutput = {
        ...order,
        status: OrderStatus.SHIPPING,
      } as Order;

      jest
        .spyOn(trackingScheduler, 'getAllOrdersByTrackingId')
        .mockResolvedValue(orders);
      const result =
        await trackingScheduler.updateStatusOrder('mock-tracking-id');

      expect(orderRepositoryMock.save).toHaveBeenCalledWith(mockOutput);
    });

    it('should update status COMPLETED for order', async () => {
      const tracking1 = {
        workflowExecution: '',
        status: WorkflowStatus.COMPLETED,
      } as Tracking;
      const trackingOrderItem1 = {
        quantity: 5,
        tracking: tracking1,
      } as TrackingOrderItem;
      const orderItem1 = {
        quantity: 5,
        trackingOrderItems: [trackingOrderItem1],
      } as OrderItem;

      const tracking2 = {
        workflowExecution: '',
        status: WorkflowStatus.COMPLETED,
      } as Tracking;
      const trackingOrderItem2 = {
        quantity: 5,
        tracking: tracking2,
      } as TrackingOrderItem;
      const orderItem2 = {
        quantity: 5,
        trackingOrderItems: [trackingOrderItem2],
      } as OrderItem;

      const order = {
        status: '',
        type: '',
        orderItems: [orderItem1, orderItem2],
      } as Order;

      const orders = [order];
      const mockOutput = {
        ...order,
        status: OrderStatus.COMPLETED,
      } as Order;

      jest
        .spyOn(trackingScheduler, 'getAllOrdersByTrackingId')
        .mockResolvedValue(orders);
      const result =
        await trackingScheduler.updateStatusOrder('mock-tracking-id');

      expect(orderRepositoryMock.save).toHaveBeenCalledWith(mockOutput);
    });
  });

  // describe('UpdateStatusTracking - test logic', () => {
  //   beforeEach(() => {
  //     jest.clearAllMocks();
  //   });

  // note: chưa mock được job.stop()
  // it('should call stopUpdateStatusTracking', async () => {
  //   (trackingRepositoryMock.find as jest.Mock).mockResolvedValue([]);
  //   const result = await trackingScheduler.UpdateStatusTracking();
  //   expect(trackingScheduler.stopUpdateStatusTracking).toHaveBeenCalled();
  // });
  // });
});
