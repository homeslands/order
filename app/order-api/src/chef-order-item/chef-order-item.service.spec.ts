import { Test, TestingModule } from '@nestjs/testing';
import { ChefOrderItemService } from './chef-order-item.service';

describe('ChefOrderItemService', () => {
  let service: ChefOrderItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChefOrderItemService],
    }).compile();

    service = module.get<ChefOrderItemService>(ChefOrderItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
