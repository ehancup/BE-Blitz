import { Test, TestingModule } from '@nestjs/testing';
import { EtalaseService } from './etalase.service';

describe('EtalaseService', () => {
  let service: EtalaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EtalaseService],
    }).compile();

    service = module.get<EtalaseService>(EtalaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
