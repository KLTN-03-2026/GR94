import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CategorisService } from './categoris.service';
import { CreateCategorisDto } from './dto/create-categoris.dto';
import { UpdateCategorisDto } from './dto/update-categoris.dto';
import { AdminGuard } from '@/guards/admin.guard';
import { GetUser } from '@/decorator/get-user.decorator';

@Controller('categoris')
export class CategorisController {
  constructor(private readonly categorisService: CategorisService) {}

  @Post('system')
  @UseGuards(AdminGuard)
  create(@Body() createCategorisDto: CreateCategorisDto) {
    return this.categorisService.createSystemCategoris(createCategorisDto);
  }

  @Get('system')
  @UseGuards(AdminGuard)
  getSystemCategoris() {
    return this.categorisService.getSystemCategoris();
  }

  @Patch('system/:id')
  @UseGuards(AdminGuard)
  updateSystemCategory(
    @Param('id') id: string,
    @Body() updateDto: UpdateCategorisDto,
  ) {
    // You only need to define this in CategorisService if it isn't there
    return this.categorisService.updateSystemCategoris(id, updateDto);
  }

  @Delete('system/:id')
  @UseGuards(AdminGuard)
  deleteSystemCategory(@Param('id') id: string) {
    return this.categorisService.removeSystemCategoris(id);
  }

  // --- USER ENDPOINTS ---

  @Post()
  createUserCategory(
    @Body() dto: CreateCategorisDto,
    @GetUser('spaceId') spaceId: string,
    @GetUser('role') role: string,
  ) {
    return this.categorisService.createUserCategoris(dto, spaceId, role);
  }

  @Get()
  getUserCategories(@GetUser('spaceId') spaceId: string) {
    return this.categorisService.getCategoriesForSpace(spaceId);
  }

  @Patch(':id')
  updateUserCategory(
    @Param('id') id: string, 
    @Body() dto: UpdateCategorisDto,
    @GetUser('role') role: string,
  ) {
    return this.categorisService.updateUserCategoris(id, dto, role);
  }

  @Delete(':id')
  deleteUserCategory(
    @Param('id') id: string,
    @GetUser('role') role: string,
  ) {
    return this.categorisService.removeUserCategoris(id, role);
  }
}
