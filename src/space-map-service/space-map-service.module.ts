import { Module } from '@nestjs/common';
import { SpaceMapServiceService } from './space-map-service.service';
import { SpaceMapServiceController } from './space-map-service.controller';

@Module({
  providers: [SpaceMapServiceService],
  controllers: [SpaceMapServiceController],
})
export class SpaceMapServiceModule {}
