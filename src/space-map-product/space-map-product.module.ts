import { Module } from '@nestjs/common';
import { SpaceMapProductService } from './space-map-product.service';
import { SpaceMapProductController } from './space-map-product.controller';

@Module({
  providers: [SpaceMapProductService],
  controllers: [SpaceMapProductController],
})
export class SpaceMapProductModule {}
