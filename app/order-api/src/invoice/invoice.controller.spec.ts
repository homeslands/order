import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Invoice } from './invoice.entity';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Order } from 'src/order/order.entity';
import { PdfService } from 'src/pdf/pdf.service';
import { QrCodeService } from 'src/qr-code/qr-code.service';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { DataSource } from 'typeorm';
import { PrinterProducer } from 'src/printer/printer.producer';
import { Printer } from 'src/printer/entity/printer.entity';
import { PrinterManager } from 'src/printer/printer.manager';
import { PrinterUtils } from 'src/printer/printer.utils';
import { PrinterJob } from 'src/printer/entity/printer-job.entity';

describe('InvoiceController', () => {
  let controller: InvoiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoiceController],
      providers: [
        InvoiceService,
        PdfService,
        QrCodeService,
        TransactionManagerService,
        {
          provide: getRepositoryToken(Order),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Invoice),
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
        {
          provide: DataSource,
          useFactory: dataSourceMockFactory,
        },
        PdfService,
        PrinterUtils,
        PrinterManager,
        PrinterProducer,
        {
          provide: getRepositoryToken(Printer),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(PrinterJob),
          useFactory: repositoryMockFactory,
        },
        {
          provide: 'BullQueue_printer',
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<InvoiceController>(InvoiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
