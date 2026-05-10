import { IsInt, IsMongoId, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
export class GetExpensesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  month?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  // Parent có thể filter theo userId cụ thể
  @IsOptional()
  @IsMongoId()
  userId?: string;

  @IsOptional()
  @IsMongoId()
  tagId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
