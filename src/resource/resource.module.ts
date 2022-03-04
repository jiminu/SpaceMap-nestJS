import { Module } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { ResourceController } from './resource.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourceEntity } from '../entities/resource.entity';
import { ResourceFileModule } from '../resource-file/resource-file.module';

@Module({
  imports: [TypeOrmModule.forFeature([ResourceEntity]), ResourceFileModule],
  controllers: [ResourceController],
  providers: [ResourceService],
  exports: [ResourceService],
})
export class ResourceModule {}
