import { Module } from '@nestjs/common';
import { CesiumService } from './cesium.service';
import { CesiumController } from './cesium.controller';

@Module({
  providers: [CesiumService],
  controllers: [CesiumController],
})
export class CesiumModule {}
