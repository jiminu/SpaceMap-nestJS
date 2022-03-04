import { QueryService } from '@nestjs-query/core';
import { TypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { ResourceFileEntity } from '../entities/resource-file.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateResourceFileDto } from './dto/create-resource-file.dto';
import { ResourceEntity } from '../entities/resource.entity';

@QueryService(ResourceFileEntity)
export class ResourceFileService extends TypeOrmQueryService<ResourceFileEntity> {
  constructor(
    @InjectRepository(ResourceFileEntity)
    private readonly resourceFileRepository: Repository<ResourceFileEntity>,
  ) {
    super(resourceFileRepository, { useSoftDelete: true });
  }

  async create(createResourceFile: CreateResourceFileDto) {
    const file = new ResourceFileEntity();
    file.resource = createResourceFile.resource;
    file.origin_name = createResourceFile.origin_name;
    file.filename = createResourceFile.filename;
    file.size = createResourceFile.size;
    file.type = createResourceFile.type;
    return await file.save();
  }

  async remove(fileIds: number[]) {
    return this.resourceFileRepository.softDelete(fileIds);
  }

  async removeFilesByResource(resource: ResourceEntity) {
    return this.resourceFileRepository.softDelete({ resource });
  }

  async findOneByFilename(filename: string) {
    return this.resourceFileRepository.findOne({ filename });
  }
}
