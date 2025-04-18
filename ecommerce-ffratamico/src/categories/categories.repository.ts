import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Category } from "./entities/categories.entity";
import { Repository } from "typeorm";


@Injectable()
export class CategoryRepository{
  private readonly mockCategories = [
    { name: 'Celulares' },
    { name: 'Notebooks' },
    { name: 'Tablets' },
    { name: 'Camaras' },
  ];
  
  constructor(@InjectRepository(Category) private repository: Repository<Category>) {}

  async getCategories() {
    return this.repository.find();
  }

  async getCategoryById(id: string){
    const category = await this.repository.findOne({where: {id}});
    if(!category) throw new NotFoundException("La categoria no existe")
    return category;
  }

  async addCategories() {
    for (const category of this.mockCategories) {
      const exists = await this.repository.findOne({ where: { name: category.name } });
      if (!exists) { //evita que se guarden las categorias por duplicado
        await this.repository.save(category);
      }
    }
  }

  async findOneByName(name: string): Promise<Category | null> {
    return await this.repository.findOne({ where: { name } });
  }
}