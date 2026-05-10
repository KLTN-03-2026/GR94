import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SpaceService } from './space.service';
import { CreateSpaceDto, JoinSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { GetUser } from '@/decorator/get-user.decorator';

@Controller('space')
export class SpaceController {
  constructor(private readonly spaceService: SpaceService) {}

  @Post('create')
  createSpace(
    @Body() dto: CreateSpaceDto,
    @GetUser('_id') userId: string,
    @GetUser('accountId') accountId: string,
    @GetUser('username') email: string,
  ) {
    return this.spaceService.createSpace(dto, userId, accountId, email);
  }
  @Post('join')
  joinSpace(
    @Body() dto: JoinSpaceDto,
    @GetUser('_id') userId: string,
    @GetUser('accountId') accountId: string,
    @GetUser('username') email: string,
  ) {
    return this.spaceService.joinSpace(dto, userId, accountId, email);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  getMySpace(@GetUser('spaceId') spaceId: string) {
    return this.spaceService.getMySpace(spaceId);
  }

  @Patch('me/members/:memberId/role')
  changeMemberRole(
    @Param('memberId') memberId: string,
    @Body('role') newRole: 'parent' | 'member',
    @GetUser('spaceId') spaceId: string,
    @GetUser('_id') currentUserId: string,
    @GetUser('role') role: string,
  ) {
    return this.spaceService.changeMemberRole(
      memberId,
      newRole,
      spaceId,
      currentUserId,
      role,
    );
  }

  // DELETE /spaces/me/members/:memberId
  @Delete('me/members/:memberId')
  removeMember(
    @Param('memberId') memberId: string,
    @GetUser('spaceId') spaceId: string,
    @GetUser('_id') currentUserId: string,
    @GetUser('role') role: string,
  ) {
    return this.spaceService.removeMember(
      memberId,
      spaceId,
      currentUserId,
      role,
    );
  }

  // --- Join Requests ---
  @Get('requests')
  getJoinRequests(
    @GetUser('spaceId') spaceId: string,
    @GetUser('role') role: string,
  ) {
    return this.spaceService.getJoinRequests(spaceId, role);
  }

  @Post('requests/:id/approve')
  approveJoinRequest(
    @Param('id') requestId: string,
    @GetUser('spaceId') spaceId: string,
    @GetUser('role') role: string,
  ) {
    return this.spaceService.approveJoinRequest(requestId, spaceId, role);
  }

  @Post('requests/:id/reject')
  rejectJoinRequest(
    @Param('id') requestId: string,
    @GetUser('spaceId') spaceId: string,
    @GetUser('role') role: string,
  ) {
    return this.spaceService.rejectJoinRequest(requestId, spaceId, role);
  }
}
