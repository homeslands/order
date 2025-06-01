import { Test, TestingModule } from '@nestjs/testing';
import { GiftCardController } from './gift-card.controller';
import { GiftCardService } from './gift-card.service';

describe('GiftCardController', () => {
  let controller: GiftCardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GiftCardController],
      providers: [GiftCardService],
    }).compile();

    controller = module.get<GiftCardController>(GiftCardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
