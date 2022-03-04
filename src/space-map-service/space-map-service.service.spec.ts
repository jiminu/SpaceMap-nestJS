import { Test, TestingModule } from '@nestjs/testing';
import { SpaceMapServiceService } from './space-map-service.service';

describe('SpaceMapServiceService', () => {
  let service: SpaceMapServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpaceMapServiceService],
    }).compile();

    service = module.get<SpaceMapServiceService>(SpaceMapServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
