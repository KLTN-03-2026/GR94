import { Injectable, ForbiddenException } from '@nestjs/common';
import { CreateCategorisDto } from './dto/create-categoris.dto';
import { UpdateCategorisDto } from './dto/update-categoris.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Categoris } from './schema/categoris.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class CategorisService {
  constructor(
    @InjectModel(Categoris.name)
    private readonly categorisModel: Model<Categoris>,
  ) {}

  // Admin tạo danh mục cho hệ thống
  async createSystemCategoris(dto: CreateCategorisDto) {
    const sysCategoris = await this.categorisModel.create({
      ...dto,
      isSystem: true,
    });
    return sysCategoris;
  }
  // User tạo danh mục của riêng họ
  async createUserCategoris(
    dto: CreateCategorisDto,
    spaceId: string,
    role: string,
  ) {
    if (role !== 'parent') {
      throw new ForbiddenException('Chỉ quản lý mới được tạo danh mục');
    }
    const userCategoris = await this.categorisModel.create({
      ...dto,
      spaceId: new Types.ObjectId(spaceId),
      isSystem: false,
    });
    return userCategoris;
  }
  // Admin lấy danh mục hệ thống
  async getSystemCategoris() {
    const sysCategoris = await this.categorisModel
      .find({ isSystem: true })
      .lean();
    return sysCategoris;
  }
  // User lấy danh mục của họ
  async getCategoriesForSpace(spaceId: string) {
    if (!spaceId) {
      // Nếu chưa có nhà, chỉ cho xem danh mục chung của Admin tạo
      return this.categorisModel.find({ isSystem: true }).lean();
    }

    // Tìm các danh mục thỏa 1 trong 2 điều kiện
    return this.categorisModel
      .find({
        $or: [
          { isSystem: true }, // 1. Là danh mục chung của App
          { spaceId: new Types.ObjectId(spaceId) }, // 2. Là danh mục do nhà này tự tạo
        ],
      })
      .lean();
  }

  // Admin sửa danh mục trong hệ thống
  async updateSystemCategoris(id: string, dto: UpdateCategorisDto) {
    const updateCategoris = await this.categorisModel.findOneAndUpdate(
      { _id: id, isSystem: true },
      { $set: dto },
      { new: true },
    );
    return updateCategoris;
  }
  // Admin xóa danh mục trong hệ thống
  async removeSystemCategoris(id: string) {
    const removeCategoris = await this.categorisModel.findOneAndDelete({
      _id: id,
      isSystem: true,
    });
    return removeCategoris;
  }
  // User sửa danh mục của riêng họ
  async updateUserCategoris(id: string, dto: UpdateCategorisDto, role: string) {
    if (role !== 'parent') {
      throw new ForbiddenException('Chỉ quản lý mới được sửa danh mục');
    }
    const updateCategoris = await this.categorisModel.findOneAndUpdate(
      { _id: id, isSystem: false },
      { $set: dto },
      { new: true },
    );
    return updateCategoris;
  }
  // User xóa danh mục của riêng họ
  async removeUserCategoris(id: string, role: string) {
    if (role !== 'parent') {
      throw new ForbiddenException('Chỉ quản lý mới được xóa danh mục');
    }
    const removeCategoris = await this.categorisModel.findOneAndDelete({
      _id: id,
      isSystem: false,
    });
    return removeCategoris;
  }
}
