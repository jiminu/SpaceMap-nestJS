import { Column, Entity } from 'typeorm';
import { BaseColumnEntity } from './base-column-entity';

@Entity('contact')
export class ContactEntity extends BaseColumnEntity {
  @Column()
  name: string;
  @Column()
  email: string;
  @Column()
  subject: string;
  @Column({ type: 'longtext' })
  message: string;
}
