import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Category } from "./entities/categories.entity";
import { Repository } from "typeorm";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { MockCategories } from "./mock/mock.categories.data";


@Injectable()
export class CategoryRepository{
  
  constructor(@InjectRepository(Category) private repository: Repository<Category>) {}

  private readonly mockCategories = MockCategories;

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
    try {
      await this.addCategory({ name: category.name });
      console.log(`Categoría "${category.name}" creada exitosamente.`);
    } catch (error) {
      if (error instanceof ConflictException) {
        console.warn(`La categoría "${category.name}" ya existe.`);
      } else {
        throw error;
      }
    }
  }
}

  async addCategory(newCategory: CreateCategoryDto): Promise<Category> {
    const normalizedInput = this.normalize(newCategory.name);

    // Traemos todas las categorías y verifiacmos que ya no exista
    const existingCategories = await this.repository.find();
    const conflict = existingCategories.find(cat => this.normalize(cat.name) === normalizedInput);

    if (conflict) {
      throw new ConflictException(`La categoría "${newCategory.name}" ya existe`);
    }

    const formattedName = this.capitalize(newCategory.name);

    const category = this.repository.create({ name: formattedName });
    return await this.repository.save(category);
  }

  async updateCategory(updateCategory: UpdateCategoryDto): Promise<Category> {
    // Sacamnos los acentos, espacios y mayúsculas del nombre actual y del nuevo.
    const normalizedCurrentName = this.normalize(updateCategory.currentName);
    const normalizedNewName = this.normalize(updateCategory.newName);

    // Traemos todas las categorias de la base de datos
    const allCategories = await this.repository.find();

    // Buscamos en la base de datos la categoria que queremos cambiar
    const targetCategory = allCategories.find(
      category => this.normalize(category.name) === normalizedCurrentName
    );
    //el if si no esta
    if (!targetCategory) {
      throw new NotFoundException(`La categoría "${updateCategory.currentName}" no existe`);
    }

    // Verificamos que no haya otra categoria con el nuevo nombre que queremos poner
    const duplicateCategory = allCategories.find(
      category =>
        this.normalize(category.name) === normalizedNewName &&
        category.id !== targetCategory.id // evitamos compararla consigo misma
    );
    // El if si existe
    if (duplicateCategory) {
      throw new ConflictException(`Ya existe una categoría con el nombre "${updateCategory.newName}"`);
    }

    // Dejamos la primer letra en mayuscula de la nueva categoria
    targetCategory.name = this.capitalize(updateCategory.newName);

    // Guardamos
    return this.repository.save(targetCategory);
  }

  async deleteCategoryById(id: string){

    const category = await this.repository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(`La categoría con ID "${id}" no existe`);
    }

    if (!category.isActive) {
      return {
        message: 'La categoría ya estaba desactivada',
        categoryId: id
      };
    }

    category.isActive = false;

    await this.repository.save(category);

    return {
      message: 'Categoría desactivada correctamente',
      categoryId: id
    };

  }

   //Elimina tildes, espacios extra y pone todo en minúscula
  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // elimina acentos
      .trim()
      .toLowerCase();
  }

 //Capitaliza: primera letra en mayúscula, resto en minúscula
  private capitalize(value: string): string {
    const cleaned = value.trim().toLowerCase();
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

}