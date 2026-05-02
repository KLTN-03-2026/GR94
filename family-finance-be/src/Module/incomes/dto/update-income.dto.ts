import { PartialType } from '@nestjs/mapped-types';
import { CreateIncomeDto } from './create-income.dto';
import {
  IsDateString,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateIncomeDto extends PartialType(CreateIncomeDto) {
  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  amount?: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}
