import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateGoalDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  targetAmount: number;

  @IsOptional()
  @IsDateString()
  expectedDate?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  icon?: string;
}

export class UpdateGoalDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  targetAmount?: number;

  @IsOptional()
  @IsDateString()
  expectedDate?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
