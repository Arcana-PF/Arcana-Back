import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { IdParamDTO } from 'src/OthersDtos/id-param.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { IsAdminGuard } from 'src/auth/guard/is-admin/isAdmin.guard';
import { Auth0Guard } from 'src/auth/guard/auth0/auth0.guard';

@ApiBearerAuth()
@ApiTags('Categories')
@UseGuards(Auth0Guard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  // @UseGuards(AuthGuard)
  getAllCategories(){
    return this.categoriesService.getAllCategories();
  }

  @Get(':id')
  // @UseGuards(AuthGuard)
  async getCategoryById(@Param() param: IdParamDTO){
    return await this.categoriesService.getCategoryById(param.id);
  }

  @Post('seeder')
  // @UseGuards(AuthGuard, IsAdminGuard)
  addCategoriesSeeder() {
    return this.categoriesService.addCategories();
  }

  @Post()
  // @UseGuards(AuthGuard, IsAdminGuard)
  async createCategory(@Body() newCategory: CreateCategoryDto){
    return await this.categoriesService.addCategory(newCategory);
  }

  @Put()
  // @UseGuards(AuthGuard, IsAdminGuard)
  async updateCategory (@Body() updateCategory: UpdateCategoryDto){
    return await this.categoriesService.updateCategory(updateCategory);
  }

  @Delete(':id')
  // @UseGuards(AuthGuard, IsAdminGuard)
  deleteCategory(@Param() param: IdParamDTO) {
    return this.categoriesService.deleteCategoryById(param.id);
  }

  
}
