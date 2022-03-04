import { Test, TestingModule } from '@nestjs/testing';
import { PpdbController } from './ppdb.controller';

describe('PpdbController', () => {
  let controller: PpdbController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PpdbController],
    }).compile();

    controller = module.get<PpdbController>(PpdbController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
