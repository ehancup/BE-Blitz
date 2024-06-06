import { Test, TestingModule } from '@nestjs/testing';
import { EtalaseController } from './etalase.controller';

describe('EtalaseController', () => {
  let controller: EtalaseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EtalaseController],
    }).compile();

    controller = module.get<EtalaseController>(EtalaseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
