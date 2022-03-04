import { Test, TestingModule } from '@nestjs/testing';
import { CesiumController } from './cesium.controller';

describe('CesiumController', () => {
  let controller: CesiumController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CesiumController],
    }).compile();

    controller = module.get<CesiumController>(CesiumController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
