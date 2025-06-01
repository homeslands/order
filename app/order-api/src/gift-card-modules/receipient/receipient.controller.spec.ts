import { Test, TestingModule } from '@nestjs/testing';
import { ReceipientController } from './receipient.controller';
import { ReceipientService } from './receipient.service';

describe('ReceipientController', () => {
  let controller: ReceipientController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReceipientController],
      providers: [ReceipientService],
    }).compile();

    controller = module.get<ReceipientController>(ReceipientController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
