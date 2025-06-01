import { Test, TestingModule } from '@nestjs/testing';
import { ReceipientService } from './receipient.service';

describe('ReceipientService', () => {
  let service: ReceipientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReceipientService],
    }).compile();

    service = module.get<ReceipientService>(ReceipientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
