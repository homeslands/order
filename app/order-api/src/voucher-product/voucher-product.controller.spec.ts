import { Test, TestingModule } from '@nestjs/testing';
import { VoucherProductController } from './voucher-product.controller';
import { VoucherProductService } from './voucher-product.service';
import { VoucherProduct } from './voucher-product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';

describe('VoucherProductController', () => {
  let controller: VoucherProductController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VoucherProductController],
      providers: [
        VoucherProductService,
        {
          provide: getRepositoryToken(VoucherProduct),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    controller = module.get<VoucherProductController>(VoucherProductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
