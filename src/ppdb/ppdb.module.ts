import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PpdbController } from './ppdb.controller';
import { PpdbService } from './ppdb.service';
import { PPDB, PPDBSchema } from './schemas/ppdbs.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PPDB.name, schema: PPDBSchema }]),
  ],
  controllers: [PpdbController],
  providers: [PpdbService],
})
export class PPDBModule {}
