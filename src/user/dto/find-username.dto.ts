import { IsNotEmpty } from 'class-validator';

export class FindUsernameDto {
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  firstname: string;
  @IsNotEmpty()
  lastname: string;
}
