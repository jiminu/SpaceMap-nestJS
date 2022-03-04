import { Module } from '@nestjs/common';
import { ResourceFileService } from './resource-file.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourceFileEntity } from '../entities/resource-file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ResourceFileEntity])],
  providers: [ResourceFileService],
  exports: [ResourceFileService],
})
export class ResourceFileModule {}
