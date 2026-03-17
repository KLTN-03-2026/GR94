import { SetMetadata } from '@nestjs/common';

// Cho phép enpoint được đi qua guard
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
