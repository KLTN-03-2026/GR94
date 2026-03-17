import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Dùng: @GetUser()           → lấy toàn bộ req.user
// Dùng: @GetUser('_id')      → lấy User._id
// Dùng: @GetUser('accountId') → lấy Account._id (dùng đổi mật khẩu)
// Dùng: @GetUser('spaceId')  → lấy spaceId (dùng trong Space routes)
// Dùng: @GetUser('role')     → lấy role (parent | member)
export const GetUser = createParamDecorator(
  (field: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return field ? user?.[field] : user;
  },
);
