import { Injectable } from '@nestjs/common';
import { CategoryRepository } from './categories.repository';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {

  constructor(private readonly categoryRepository: CategoryRepository) { }

  addCategories() {
    return this.categoryRepository.addCategories();
  }

  getAllCategories(){
    return this.categoryRepository.getCategories();
  }

  async getCategoryById(id: string){
    return this.categoryRepository.getCategoryById(id);
  }

  async addCategory(newCategory) {
    return await this.categoryRepository.addCategory(newCategory);
  }

  async updateCategory(updateCategory: UpdateCategoryDto) {
    return await this.categoryRepository.updateCategory(updateCategory);
  }

  async deleteCategoryById(id: string) {
    return this.categoryRepository.deleteCategoryById(id);
  }
}
