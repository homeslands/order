import { Test, TestingModule } from '@nestjs/testing';
import { ReceipientController } from './recipient.controller';
import { RecipientService } from './recipient.service';

describe('RecipientController', () => {
  let controller: ReceipientController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReceipientController],
      providers: [RecipientService],
    }).compile();

    controller = module.get<ReceipientController>(ReceipientController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
