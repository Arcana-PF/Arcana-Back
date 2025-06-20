import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { IdParamDTO } from 'src/OthersDtos/id-param.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { IsAdminGuard } from 'src/auth/guard/is-admin/isAdmin.guard';


@ApiBearerAuth()
@ApiTags('Categories')
@UseGuards(AuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  getAllCategories(){
    return this.categoriesService.getAllCategories();
  }

  @Get(':id')
  async getCategoryById(@Param() param: IdParamDTO){
    return await this.categoriesService.getCategoryById(param.id);
  }

  @Post('seeder')
  @UseGuards(IsAdminGuard)
  addCategoriesSeeder() {
    return this.categoriesService.addCategories();
  }

  @Post()
  @UseGuards(IsAdminGuard)
  async createCategory(@Body() newCategory: CreateCategoryDto){
    return await this.categoriesService.addCategory(newCategory);
  }

  @Put()
  @UseGuards(IsAdminGuard)
  async updateCategory (@Body() updateCategory: UpdateCategoryDto){
    return await this.categoriesService.updateCategory(updateCategory);
  }

  @Delete(':id')
  @UseGuards(IsAdminGuard)
  deleteCategory(@Param() param: IdParamDTO) {
    return this.categoriesService.deleteCategoryById(param.id);
  }

  
}
