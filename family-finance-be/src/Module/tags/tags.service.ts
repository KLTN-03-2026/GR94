import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Tag } from './schema/tag.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class TagsService {
  constructor(@InjectModel(Tag.name) private readonly tagModel: Model<Tag>) {}

  async create(createTagDto: CreateTagDto, spaceID: string, role: string) {
    if (role !== 'parent') {
      throw new ForbiddenException('Chỉ quản lý mới được tạo Tag');
    }

    const newTag = await this.tagModel.create({
      ...createTagDto,
      spaceID: new Types.ObjectId(spaceID),
    });
    return newTag;
  }

  async findAll(spaceID: string) {
    return this.tagModel.find({ spaceID: new Types.ObjectId(spaceID) }).lean();
  }

  async findOne(id: string, spaceID: string) {
    const tag = await this.tagModel
      .findOne({
        _id: new Types.ObjectId(id),
        spaceID: new Types.ObjectId(spaceID),
      })
      .lean();
    if (!tag) throw new NotFoundException('Không tìm thấy tag');
    return tag;
  }

  async update(id: string, updateTagDto: UpdateTagDto, spaceID: string, role: string) {
    if (role !== 'parent') {
      throw new ForbiddenException('Chỉ quản lý mới được sửa Tag');
    }

    const tag = await this.tagModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), spaceID: new Types.ObjectId(spaceID) },
      updateTagDto,
      { new: true },
    );
    if (!tag) throw new NotFoundException('Không tìm thấy tag');
    return tag;
  }

  async remove(id: string, spaceID: string, role: string) {
    if (role !== 'parent') {
      throw new ForbiddenException('Chỉ quản lý mới được xóa Tag');
    }

    const tag = await this.tagModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
      spaceID: new Types.ObjectId(spaceID),
    });
    if (!tag) throw new NotFoundException('Không tìm thấy tag');
    return { message: 'Đã xóa tag' };
  }
}
