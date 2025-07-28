import { Test, TestingModule } from '@nestjs/testing';
import { PrinterController } from './printer.controller';
import { PrinterService } from './printer.service';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { PrinterJob } from './entity/printer-job.entity';
import { PdfService } from 'src/pdf/pdf.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChefOrder } from 'src/chef-order/chef-order.entity';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { InvoiceService } from 'src/invoice/invoice.service';
import { QrCodeService } from 'src/qr-code/qr-code.service';
import { Order } from 'src/order/order.entity';
import { Invoice } from 'src/invoice/invoice.entity';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { DataSource } from 'typeorm';

describe('PrinterController', () => {
  let controller: PrinterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrinterController],
      providers: [
        PrinterService,
        PdfService,
        {
          provide: getRepositoryToken(PrinterJob),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(ChefOrder),
          useFactory: repositoryMockFactory,
        },
        {
          provide: MAPPER_MODULE_PROVIDER,
          useFactory: mapperMockFactory,
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: console, // Mock logger (or a custom mock)
        },
        InvoiceService,
        QrCodeService,
        {
          provide: getRepositoryToken(Invoice),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Order),
          useFactory: repositoryMockFactory,
        },
        TransactionManagerService,
        {
          provide: DataSource,
          useFactory: dataSourceMockFactory,
        },
      ],
    }).compile();

    controller = module.get<PrinterController>(PrinterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
