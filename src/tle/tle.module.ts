import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TleService } from './tle.service';
import { TleController } from './tle.controller';
import { TLE, TLESchema } from './schemas/tles.schema';

@Module({
    imports: [
    MongooseModule.forFeature([{ name: TLE.name, schema: TLESchema }]),
  ],
  providers: [TleService],
  controllers: [TleController]
})
export class TleModule {}
