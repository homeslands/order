import { Test, TestingModule } from '@nestjs/testing';
import { RecipientService } from './recipient.service';

describe('RecipientService', () => {
  let service: RecipientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecipientService],
    }).compile();

    service = module.get<RecipientService>(RecipientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
