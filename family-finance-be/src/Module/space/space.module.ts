import { Module } from '@nestjs/common';
import { SpaceService } from './space.service';
import { SpaceController } from './space.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Space, SpaceSchema } from './schema/space.schema';
import { User, UserSchema } from '../users/schema/user.shcema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Space.name, schema: SpaceSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [SpaceController],
  providers: [SpaceService],
  exports: [SpaceService, MongooseModule],
})
export class SpaceModule {}
