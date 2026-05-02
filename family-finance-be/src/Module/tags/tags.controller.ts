import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { GetUser } from '@/decorator/get-user.decorator';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  create(
    @Body() createTagDto: CreateTagDto,
    @GetUser('spaceId') spaceId: string,
    @GetUser('role') role: string,
  ) {
    return this.tagsService.create(createTagDto, spaceId, role);
  }

  @Get()
  findAll(@GetUser('spaceId') spaceId: string) {
    return this.tagsService.findAll(spaceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser('spaceId') spaceId: string) {
    return this.tagsService.findOne(id, spaceId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
    @GetUser('spaceId') spaceId: string,
    @GetUser('role') role: string,
  ) {
    return this.tagsService.update(id, updateTagDto, spaceId, role);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @GetUser('spaceId') spaceId: string,
    @GetUser('role') role: string,
  ) {
    return this.tagsService.remove(id, spaceId, role);
  }
}
