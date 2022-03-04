import { IsNotEmpty } from 'class-validator';

export class FindPasswordDto {
  @IsNotEmpty()
  username: string;
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  firstname: string;
  @IsNotEmpty()
  lastname: string;
}
