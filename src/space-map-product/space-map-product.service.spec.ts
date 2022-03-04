import { Test, TestingModule } from '@nestjs/testing';
import { SpaceMapProductService } from './space-map-product.service';

describe('SpaceMapProductService', () => {
  let service: SpaceMapProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpaceMapProductService],
    }).compile();

    service = module.get<SpaceMapProductService>(SpaceMapProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
