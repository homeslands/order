import { Test, TestingModule } from '@nestjs/testing';
import { JobService } from './job.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Order } from 'src/order/order.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { Job } from './job.entity';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { OrderUtils } from 'src/order/order.utils';
import { NotificationUtils } from 'src/notification/notification.utils';
import { InvoiceService } from 'src/invoice/invoice.service';
import { MailService } from 'src/mail/mail.service';
import { ChefOrderUtils } from 'src/chef-order/chef-order.utils';
import { MenuUtils } from 'src/menu/menu.utils';
import { MenuItemUtils } from 'src/menu-item/menu-item.utils';
import { PdfService } from 'src/pdf/pdf.service';
import { QrCodeService } from 'src/qr-code/qr-code.service';
import { ChefOrderItemUtils } from 'src/chef-order-item/chef-order-item.utils';
import { JobRecoveryService } from './job.recovery';
import { ChefOrder } from 'src/chef-order/chef-order.entity';
import { ChefOrderItem } from 'src/chef-order-item/chef-order-item.entity';
import { Invoice } from 'src/invoice/invoice.entity';
import { ChefArea } from 'src/chef-area/chef-area.entity';
import { Product } from 'src/product/product.entity';
import { User } from 'src/user/user.entity';
import { MenuItem } from 'src/menu-item/menu-item.entity';
import { Menu } from 'src/menu/menu.entity';
import { MailProducer } from 'src/mail/mail.producer';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { NotificationProducer } from 'src/notification/notification.producer';
import { JobScheduler } from './job.scheduler';
import { CardOrder } from 'src/gift-card-modules/card-order/entities/card-order.entity';
import { PaymentUtils } from 'src/payment/payment.utils';
import { Payment } from 'src/payment/payment.entity';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { ACBConnectorClient } from 'src/acb-connector/acb-connector.client';
import { BankTransferStrategy } from 'src/payment/strategy/bank-transfer.strategy';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ACBConnectorConfig } from 'src/acb-connector/acb-connector.entity';
import { SystemConfig } from 'src/system-config/system-config.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('JobService', () => {
  let service: JobService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobScheduler,
        TransactionManagerService,
        JobService,
        OrderUtils,
        MailService,
        InvoiceService,
        ChefOrderUtils,
        MenuUtils,
        MenuItemUtils,
        PdfService,
        QrCodeService,
        ChefOrderItemUtils,
        JobRecoveryService,
        NotificationUtils,
        MailProducer,
        NotificationProducer,
        PaymentUtils,
        BankTransferStrategy,
        ACBConnectorClient,
        ConfigService,
        HttpService,
        SystemConfigService,
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(), // Mock the emit method
          },
        },
        {
          provide: getRepositoryToken(Payment),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(ACBConnectorConfig),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(SystemConfig),
          useValue: repositoryMockFactory,
        },
        {
          provide: 'AXIOS_INSTANCE_TOKEN',
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
          },
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: console,
        },
        {
          provide: MAPPER_MODULE_PROVIDER,
          useFactory: mapperMockFactory,
        },
        { provide: 'BullQueue_job', useValue: {} },
        { provide: 'BullQueue_mail', useValue: {} },
        { provide: 'BullQueue_notification', useValue: {} },
        {
          provide: getRepositoryToken(Order),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(CardOrder),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Job),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(ChefOrder),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(ChefOrderItem),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Invoice),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(ChefArea),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Product),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(ChefOrderItem),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(MenuItem),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Menu),
          useFactory: repositoryMockFactory,
        },
        {
          provide: TransactionManagerService,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<JobService>(JobService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
