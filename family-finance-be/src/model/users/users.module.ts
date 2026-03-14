import { Module } from '@nestjs/common';

import { User, UserSchema } from 'src/model/users/schema/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from 'src/Module/users/users.controller';
import { UsersService } from 'src/Module/users/users.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],

  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
