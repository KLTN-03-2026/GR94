import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTagDto {
  @IsNotEmpty({ message: 'Tên tag không được để trống' })
  @IsString()
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  color?: string;
}
