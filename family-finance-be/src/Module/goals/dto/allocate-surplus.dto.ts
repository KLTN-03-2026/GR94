import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class AllocationItemDto {
  @IsNotEmpty()
  @IsString()
  goalID: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;
}

export class AllocateSurplusDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AllocationItemDto)
  allocations: AllocationItemDto[];
}
