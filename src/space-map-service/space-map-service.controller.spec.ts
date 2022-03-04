import { Test, TestingModule } from '@nestjs/testing';
import { SpaceMapServiceController } from './space-map-service.controller';

describe('SpaceMapServiceController', () => {
  let controller: SpaceMapServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpaceMapServiceController],
    }).compile();

    controller = module.get<SpaceMapServiceController>(
      SpaceMapServiceController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
