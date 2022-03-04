import { Test, TestingModule } from '@nestjs/testing';
import { PpdbService } from './ppdb.service';

describe('PpdbService', () => {
  let service: PpdbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PpdbService],
    }).compile();

    service = module.get<PpdbService>(PpdbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
