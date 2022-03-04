import { BaseColumnEntity } from './base-column-entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { ResourceEntity } from './resource.entity';

@Entity('resource_file')
export class ResourceFileEntity extends BaseColumnEntity {
  @Column()
  origin_name: string;
  @Column()
  filename: string;
  @Column()
  type: string;
  @Column()
  size: number;

  @ManyToOne(() => ResourceEntity, (resource) => resource.files)
  resource: ResourceEntity;
}
