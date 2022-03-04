import { Test, TestingModule } from '@nestjs/testing';
import { CesiumService } from './cesium.service';

describe('CesiumService', () => {
  let service: CesiumService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CesiumService],
    }).compile();

    service = module.get<CesiumService>(CesiumService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
