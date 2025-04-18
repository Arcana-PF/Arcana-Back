import { Controller, Get, Param, Post } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { IdParamDTO } from 'src/Id-Param.DTO';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post('seeder')
  addCategoriesSeeder() {
    return this.categoriesService.addCategories();
  }

  @Get()
  getAllCategories(){
    return this.categoriesService.getAllCategories();
  }

  @Get(':id')
  async getCategoryById(@Param() param: IdParamDTO){
    return await this.categoriesService.getCategoryById(param.id);
  }
}
