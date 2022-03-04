import { Test, TestingModule } from '@nestjs/testing';
import { TleService } from './tle.service';

describe('TleService', () => {
  let service: TleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TleService],
    }).compile();

    service = module.get<TleService>(TleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
