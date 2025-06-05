import { Test, TestingModule } from '@nestjs/testing';
import { CardOrderService } from './card-order.service';

describe('CardOrderService', () => {
  let service: CardOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CardOrderService],
    }).compile();

    service = module.get<CardOrderService>(CardOrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
