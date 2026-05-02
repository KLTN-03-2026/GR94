import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsMongoId,
  Min,
  IsDateString,
  IsOptional,
  MaxLength,
  IsArray,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateIncomeDto {
  @IsMongoId({ message: 'categoryID không hợp lệ' })
  categoryID: Types.ObjectId;

  @IsNumber({}, { message: 'amount phải là số' })
  @Min(1, { message: 'Số tiền phải lớn hơn 0' })
  @Type(() => Number)
  amount: number;

  @IsDateString({}, { message: 'date phải đúng định dạng YYYY-MM-DD' })
  date: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
