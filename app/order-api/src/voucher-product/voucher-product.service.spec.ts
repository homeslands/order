import { Test, TestingModule } from '@nestjs/testing';
import { VoucherProductService } from './voucher-product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VoucherProduct } from './voucher-product.entity';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';

describe('VoucherProductService', () => {
  let service: VoucherProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VoucherProductService,
        {
          provide: getRepositoryToken(VoucherProduct),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<VoucherProductService>(VoucherProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
