import { Module } from '@nestjs/common';
import { EtalaseController } from './etalase.controller';
import { EtalaseService } from './etalase.service';

@Module({
  controllers: [EtalaseController],
  providers: [EtalaseService]
})
export class EtalaseModule {}
