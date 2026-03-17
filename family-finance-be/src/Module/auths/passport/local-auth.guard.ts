import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Gọi LocalStrategy để validate email + password
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
