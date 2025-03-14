import { Test, TestingModule } from '@nestjs/testing';
import { AuthorityController } from './authority.controller';
import { AuthorityService } from './authority.service';

describe('AuthorityController', () => {
  let controller: AuthorityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthorityController],
      providers: [AuthorityService],
    }).compile();

    controller = module.get<AuthorityController>(AuthorityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
