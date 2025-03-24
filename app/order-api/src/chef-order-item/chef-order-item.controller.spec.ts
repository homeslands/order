import { Test, TestingModule } from '@nestjs/testing';
import { ChefOrderItemController } from './chef-order-item.controller';
import { ChefOrderItemService } from './chef-order-item.service';

describe('ChefOrderItemController', () => {
  let controller: ChefOrderItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChefOrderItemController],
      providers: [ChefOrderItemService],
    }).compile();

    controller = module.get<ChefOrderItemController>(ChefOrderItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
