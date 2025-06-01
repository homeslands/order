import { Test, TestingModule } from '@nestjs/testing';
import { GiftCardService } from './gift-card.service';

describe('GiftCardService', () => {
  let service: GiftCardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GiftCardService],
    }).compile();

    service = module.get<GiftCardService>(GiftCardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
