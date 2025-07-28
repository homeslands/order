import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceAreaController } from './invoice-area.controller';
import { InvoiceAreaService } from './invoice-area.service';

describe('InvoiceAreaController', () => {
  let controller: InvoiceAreaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoiceAreaController],
      providers: [InvoiceAreaService],
    }).compile();

    controller = module.get<InvoiceAreaController>(InvoiceAreaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
