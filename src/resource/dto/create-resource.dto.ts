import { UserEntity } from '../../entities/user.entity';

export class CreateResourceDto {
  board_type: string;
  title: string;
  content: string;
  files?: string[];
  user: UserEntity;
}
