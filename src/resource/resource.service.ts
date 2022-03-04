import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { QueryService } from '@nestjs-query/core';
import { ResourceEntity } from '../entities/resource.entity';
import { TypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { SearchDto } from '../helpers/dto/search.dto';

@QueryService(ResourceEntity)
export class ResourceService extends TypeOrmQueryService<ResourceEntity> {
  constructor (
    @InjectRepository(ResourceEntity)
    private readonly resourceRepository: Repository<ResourceEntity>,
  ) {
    super(resourceRepository, { useSoftDelete: true });
  }

  async create (createResourceDto: CreateResourceDto) {
    const resource = new ResourceEntity();
    resource.board_type = createResourceDto.board_type;
    resource.title = createResourceDto.title;
    resource.content = createResourceDto.content;
    resource.user = createResourceDto.user;
    return await resource.save();
  }

  async update (id: number, updateResourceDto: UpdateResourceDto) {
    const resource = await this.resourceRepository.findOne(id);
    resource.board_type = updateResourceDto.board_type;
    resource.title = updateResourceDto.title;
    resource.content = updateResourceDto.content;
    return await resource.save();
  }

  async paginate (
    options: IPaginationOptions,
    searchDto: SearchDto,
  ): Promise<Pagination<ResourceEntity>> {
    const boardType = searchDto.boardType ?? 'document';
    const builder = await this.resourceRepository
                              .createQueryBuilder('resource')
                              .leftJoinAndSelect('resource.user', 'user')
                              .leftJoinAndSelect('resource.files', 'files');

    if (searchDto.boardType) builder.where('resource.board_type = :boardType', { boardType });

    builder.orderBy(searchDto.orderByField, searchDto.orderByDirection);

    return paginate<ResourceEntity>(builder, options);
  }

  async findOne (id: number) {
    return await this.resourceRepository
                     .createQueryBuilder('resource')
                     .leftJoinAndSelect('resource.files', 'files')
                     .where('resource.id = :id', { id })
                     .getOne();
  }

  async findPrev (id: number, boardType: string) {
    return await this.resourceRepository
                     .createQueryBuilder('resource')
                     .where('id < :id', { id })
                     .andWhere('board_type = :boardType', { boardType })
                     .orderBy('id', 'DESC')
                     .getOne();
  }

  async findNext (id: number, boardType: string) {
    return await this.resourceRepository
                     .createQueryBuilder('resource')
                     .where('id > :id', { id })
                     .andWhere('board_type = :boardType', { boardType })
                     .orderBy('id', 'ASC')
                     .getOne();
  }

  async remove (id: number) {
    return await this.resourceRepository.softDelete(id);
  }
}
