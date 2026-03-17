import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import mongoose from 'mongoose';

import { hashPasswordHelper, comparePasswordHelper } from '@/helper/util';
import { CreateAuthDto } from '@/Module/auths/dto/create-auth.dto';

import { MailerService } from '@nestjs-modules/mailer';
import dayjs from 'dayjs';
import {
  Account,
  AccountDocument,
} from '@/Module/account/schema/account.schema';
import { User, UserDocument } from '@/Module/users/schema/user.shcema';
import { CreateUserDto } from '@/Module/users/dto/create-user.dto';
import {
  UpdateProfileDto,
  UpdateUserDto,
} from '@/Module/users/dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly mailerService: MailerService,
  ) {}

  //  Check email tồn tại
  async isEmailExists(email: string): Promise<boolean> {
    const found = await this.accountModel.exists({
      email: email.toLowerCase(),
    });
    return !!found;
  }

  //  Tìm Account theo email — trả null nếu không có
  // Dùng trong AuthService.validateUser() — KHÔNG throw lỗi
  async findAccountByEmail(email: string): Promise<AccountDocument | null> {
    return this.accountModel.findOne({ email: email.toLowerCase() }).lean();
  }

  //  Gộp Account + User thành 1 object để tạo JWT
  // Gọi sau khi validate password thành công
  async getFullProfile(accountId: string | Types.ObjectId) {
    const [account, user] = await Promise.all([
      this.accountModel.findById(accountId).lean(),
      this.userModel.findOne({ accountId }).lean(),
    ]);
    if (!account || !user) return null;

    return {
      // Từ Account
      accountId: account._id,
      email: account.email,
      is_active: account.is_active,
      // Từ User
      _id: user._id, // userId — dùng làm sub trong JWT
      name: user.name,
      avatar: user.avatar,
      spaceId: user.spaceId,
      role: user.role,
    };
  }

  //  Đăng ký tài khoản mới
  // SỬA: tạo 2 document riêng (Account + User), mã 6 số thay UUID
  async handleRegister(dto: CreateAuthDto) {
    const exists = await this.isEmailExists(dto.email);
    if (exists) {
      throw new BadRequestException(`Email ${dto.email} đã tồn tại`);
    }

    const passwordHash = await hashPasswordHelper(dto.password);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expired = dayjs().add(5, 'minutes').toDate();

    // Tạo Account (thông tin đăng nhập)
    const account = await this.accountModel.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      is_active: false,
      code_verification: code,
      code_expired: expired,
    });

    // Tạo User (thông tin cá nhân) — liên kết với Account
    const user = await this.userModel.create({
      accountId: account._id,
      name: dto.name,
      // spaceId + role = null mặc định, gán sau khi tạo/join space
    });

    // Gửi email kích hoạt
    try {
      await this.mailerService.sendMail({
        to: account.email,
        subject: 'Kích hoạt tài khoản',
        template: 'sendmail',
        context: { name: user.name, activationCode: code },
      });
    } catch (err) {
      console.error('Lỗi gửi email:', err.message);
    }

    return {
      message:
        'Đăng ký thành công. Vui lòng kiểm tra email để lấy mã kích hoạt.',
      _id: user._id,
    };
  }

  //  Kích hoạt tài khoản
  // Gọi bởi AuthService.verifyAccount()
  async activateAccount(accountId: string) {
    await this.accountModel.updateOne(
      { _id: accountId },
      { is_active: true, code_verification: null, code_expired: null },
    );
  }

  //  Gửi lại mã kích hoạt
  async resendVerifyCode(email: string) {
    const account = await this.accountModel.findOne({
      email: email.toLowerCase(),
    });
    if (!account) throw new BadRequestException('Email không tồn tại');
    if (account.is_active)
      throw new BadRequestException('Tài khoản đã được kích hoạt rồi');

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expired = dayjs().add(5, 'minutes').toDate();

    await this.accountModel.updateOne(
      { _id: account._id },
      { code_verification: code, code_expired: expired },
    );

    const user = await this.userModel
      .findOne({ accountId: account._id })
      .lean();

    try {
      await this.mailerService.sendMail({
        to: account.email,
        subject: 'Mã kích hoạt mới',
        template: 'sendmail',
        context: { name: user?.name ?? account.email, activationCode: code },
      });
    } catch (err) {
      console.error('Lỗi gửi email:', err.message);
    }

    return { message: 'Đã gửi lại mã kích hoạt. Vui lòng kiểm tra email.' };
  }

  //  Đổi mật khẩu
  async changePassword(
    accountId: string,
    currentPass: string,
    newPass: string,
  ) {
    const account = await this.accountModel.findById(accountId);
    if (!account) throw new BadRequestException('Không tìm thấy tài khoản');

    const isValid = await comparePasswordHelper(
      currentPass,
      account.passwordHash,
    );
    if (!isValid) throw new BadRequestException('Mật khẩu hiện tại không đúng');

    const newHash = await hashPasswordHelper(newPass);
    await this.accountModel.updateOne(
      { _id: accountId },
      { passwordHash: newHash },
    );

    return { message: 'Đổi mật khẩu thành công' };
  }

  //  Admin tạo user trực tiếp
  async create(dto: CreateUserDto) {
    const exists = await this.isEmailExists(dto.email);
    if (exists) throw new BadRequestException(`Email ${dto.email} đã tồn tại`);

    const passwordHash = await hashPasswordHelper(dto.password);

    const account = await this.accountModel.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      is_active: true, // Admin tạo → kích hoạt luôn
    });

    const user = await this.userModel.create({
      accountId: account._id,
      name: dto.name,
      role: dto.role ?? null,
    });

    return { _id: user._id, name: user.name };
  }

  //  Lấy tất cả users (Admin)
  // SỬA: dùng countDocuments thay vì .find().length
  async findAll(query: string, current: number, pageSize: number) {
    const { default: aqp } = await import('api-query-params');
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItems = await this.userModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;

    const result = await this.userModel
      .find(filter)
      .skip(skip)
      .limit(pageSize)
      .populate('accountId', 'email is_active createdAt')
      .sort(sort as any)
      .lean();

    return { result, totalPages, totalItems };
  }

  //  User tự cập nhật profile
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.userModel.findByIdAndUpdate(userId, dto, { new: true }).lean();
  }

  //  Admin cập nhật user
  async update(dto: UpdateUserDto) {
    if (!dto._id) throw new BadRequestException('ID không hợp lệ');
    return this.userModel.updateOne({ _id: dto._id }, { ...dto });
  }

  //  Xóa user + account
  // SỬA: xóa cả Account khi xóa User
  async remove(_id: string) {
    if (!mongoose.isValidObjectId(_id)) {
      throw new BadRequestException('ID không hợp lệ');
    }
    const user = await this.userModel.findById(_id);
    if (!user) throw new BadRequestException('Không tìm thấy user');

    await Promise.all([
      this.accountModel.deleteOne({ _id: user.accountId }),
      this.userModel.deleteOne({ _id }),
    ]);

    return { message: 'Xóa user thành công' };
  }
}
