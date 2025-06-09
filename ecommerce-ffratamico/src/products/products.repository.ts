import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CategoryRepository } from 'src/categories/categories.repository';
import { MockProducts } from './mock/mock.products.data';


@Injectable()
export class ProductsRepository {

  constructor(@InjectRepository(Product) private repository: Repository<Product>, private readonly categoryRepository: CategoryRepository){}

  private readonly mockProducts = MockProducts;

  async addProductsSeeder(): Promise<void> {
    for (const product of this.mockProducts) {
      try {
        const createProductDto: CreateProductDto = {
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          imgUrl: product.imgUrl,
          categoryName: product.categoryName
        };

        await this.createProduct(createProductDto);
        console.log(`✅ Producto "${product.name}" creado con éxito.`);

      } catch (error) {
        if (error instanceof ConflictException) {
          console.warn(`⚠️ El producto "${product.name}" ya existe. Se omitió.`);
        } else if (error instanceof NotFoundException) {
          console.warn(`⚠️ Categoría "${product.categoryName}" no encontrada. Se omitió el producto "${product.name}".`);
        } else {
          throw error;
        }
      }
    }
  }

  async getProducts() {
    return await this.repository.find();
  }

  async getProductsWithPagination(page, limit) {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const products = await this.repository.find();
    return products.slice(startIndex, endIndex).map((product) => product);
  }

  async getProductById(id: string) {
    const product= await this.repository.findOne({where: {id}});
    if(!product) throw new NotFoundException("El id del producto no existe")
    return product;
  }

  async createProduct(createProductDto: CreateProductDto) {
  // Normalizamos el nombre de la categoría
  const normalizedCategoryNameInput = this.normalize(createProductDto.categoryName);
  // Obtenemos todas las categorías disponibles 
  const allCategoriesFromDatabase = await this.categoryRepository.getCategories();
  // Buscamos la categoría que coincida
  const matchedCategory = allCategoriesFromDatabase.find(
    existingCategory =>
      this.normalize(existingCategory.name) === normalizedCategoryNameInput
  );

  if (!matchedCategory) {
    throw new NotFoundException(`La categoría "${createProductDto.categoryName}" no existe`);
  }

  const existingProductWithSameName = await this.repository.findOne({
    where: { name: createProductDto.name },
  });

  if (existingProductWithSameName) {
    throw new ConflictException(`Ya existe un producto con el nombre "${createProductDto.name}"`);
  }

  const { categoryName, ...productDataWithoutCategoryName } = createProductDto;

  const newProductToSave = this.repository.create({
    ...productDataWithoutCategoryName,
    category: matchedCategory
  });

  await this.repository.save(newProductToSave);

  return newProductToSave;
}

  async deleteProduct(id: string) {
    const exists = await this.repository.findOne({where:{id}});
    if(!exists) throw new NotFoundException("El producto que desea borrar no existe");
    await this.repository.delete(id);
    return id;
  }

  async updateProduct(id: string, updateProduct: UpdateProductDto) {
    const exists = await this.repository.findOne({where:{id}});
    if(!exists) throw new NotFoundException("El producto que desea modificar no existe");

    const updatedProduct = Object.assign(exists, updateProduct);
    await this.repository.save(updatedProduct);
    return id;
  }

  private normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

}
