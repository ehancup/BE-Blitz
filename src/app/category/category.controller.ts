import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './category.dto';
import { JwtGuard } from 'src/guard/auth/auth.guard';
import { RoleGuard } from 'src/guard/role/role.guard';
import { Roles } from 'src/guard/role/role.reflector';

@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['seller'])
  @Post('/create')
  create(@Body() payload: CreateCategoryDto) {
    return this.categoryService.createCategory(payload);
  }

  @Get('/list')
  list() {
    return this.categoryService.list();
  }
}
