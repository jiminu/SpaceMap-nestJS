import { Test, TestingModule } from '@nestjs/testing';
import { TleController } from './tle.controller';

describe('TleController', () => {
  let controller: TleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TleController],
    }).compile();

    controller = module.get<TleController>(TleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
