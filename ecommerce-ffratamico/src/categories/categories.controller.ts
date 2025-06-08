import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { IdParamDTO } from 'src/OthersDtos/id-param.dto';
import { ApiTags } from '@nestjs/swagger';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Categories')
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
  addCategoriesSeeder() {
    return this.categoriesService.addCategories();
  }

  @Post()
  async createCategory(@Body() newCategory: CreateCategoryDto){
    return await this.categoriesService.addCategory(newCategory);
  }

  @Put()
  async updateCategory (@Body() updateCategory: UpdateCategoryDto){
    return await this.categoriesService.updateCategory(updateCategory);
  }

  @Delete(':id')
  deleteCategory(@Param() param: IdParamDTO) {
    return this.categoriesService.deleteCategoryById(param.id);
  }

  
}
