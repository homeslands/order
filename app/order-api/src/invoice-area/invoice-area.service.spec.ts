import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceAreaService } from './invoice-area.service';

describe('InvoiceAreaService', () => {
  let service: InvoiceAreaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvoiceAreaService],
    }).compile();

    service = module.get<InvoiceAreaService>(InvoiceAreaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
