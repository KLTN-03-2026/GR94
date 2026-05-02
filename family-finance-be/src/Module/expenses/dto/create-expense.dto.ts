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
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateExpenseDto {
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
  @IsMongoId({ each: true, message: 'Tag ID không hợp lệ' })
  tags?: string[];
}
