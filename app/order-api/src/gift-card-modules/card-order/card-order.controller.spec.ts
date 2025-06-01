import { Test, TestingModule } from '@nestjs/testing';
import { CardOrderController } from './card-order.controller';
import { CardOrderService } from './card-order.service';

describe('CardOrderController', () => {
  let controller: CardOrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardOrderController],
      providers: [CardOrderService],
    }).compile();

    controller = module.get<CardOrderController>(CardOrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
