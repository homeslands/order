import { Test, TestingModule } from '@nestjs/testing';
import { AccumulatedPointController } from './accumulated-point.controller';
import { AccumulatedPointService } from './accumulated-point.service';

describe('AccumulatedPointController', () => {
  let controller: AccumulatedPointController;
  // let service: AccumulatedPointService;

  const mockService = {
    getTotalPointsByUserSlug: jest.fn(),
    usePointsForOrder: jest.fn(),
    getPointsHistory: jest.fn(),
    refundPointsForCancelledOrder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccumulatedPointController],
      providers: [
        {
          provide: AccumulatedPointService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AccumulatedPointController>(
      AccumulatedPointController,
    );
    // service = module.get<AccumulatedPointService>(AccumulatedPointService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
