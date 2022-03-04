import { BaseColumnEntity } from './base-column-entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { ResourceFileEntity } from './resource-file.entity';
import { UserEntity } from './user.entity';

@Entity('resource')
export class ResourceEntity extends BaseColumnEntity {
  @Column({ default: 'document' })
  board_type: string;
  @Column()
  title: string;
  @Column({ type: 'longtext' })
  content: string;

  @OneToMany(() => ResourceFileEntity, (file) => file.resource)
  files: ResourceFileEntity[];

  @ManyToOne(() => UserEntity, (user) => user.resources)
  user: UserEntity;
}
