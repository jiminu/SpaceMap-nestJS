import { Column, Entity, OneToMany, Unique } from 'typeorm';
import { BaseColumnEntity } from './base-column-entity';
import { ResourceEntity } from './resource.entity';

@Entity('user')
@Unique(['username'])
export class UserEntity extends BaseColumnEntity {
  @Column()
  user_type: string;
  @Column()
  username: string;
  @Column()
  password: string;

  @Column()
  firstname: string;
  @Column()
  lastname: string;
  @Column()
  affiliation: string;
  @Column()
  email: string;

  @Column({ type: 'timestamp' })
  last_logged_at: Date;

  @OneToMany(() => ResourceEntity, (resource) => resource.user)
  resources: ResourceEntity[];
}
