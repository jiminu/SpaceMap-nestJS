import { Test, TestingModule } from '@nestjs/testing';
import { SpaceMapProductController } from './space-map-product.controller';

describe('SpaceMapProductController', () => {
  let controller: SpaceMapProductController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpaceMapProductController],
    }).compile();

    controller = module.get<SpaceMapProductController>(
      SpaceMapProductController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
