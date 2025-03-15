import { Test, TestingModule } from '@nestjs/testing';
import { AuthorityService } from './authority.service';

describe('AuthorityService', () => {
  let service: AuthorityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthorityService],
    }).compile();

    service = module.get<AuthorityService>(AuthorityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
