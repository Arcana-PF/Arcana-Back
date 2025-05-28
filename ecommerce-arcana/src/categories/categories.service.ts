import { Injectable } from '@nestjs/common';
import { CategoryRepository } from './categories.repository';

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
}
