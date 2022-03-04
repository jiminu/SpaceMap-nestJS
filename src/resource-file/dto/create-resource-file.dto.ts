import { ResourceEntity } from '../../entities/resource.entity';

export class CreateResourceFileDto {
  origin_name: string;
  filename: string;
  type: string;
  size: number;
  resource: ResourceEntity;
}
