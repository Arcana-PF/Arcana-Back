import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { v4 } from 'uuid';
import { ProductDTO } from './dto/product-dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CategoryRepository } from 'src/categories/categories.repository';

@Injectable()
export class ProductsRepository {

  constructor(@InjectRepository(Product) private repository: Repository<Product>, private readonly categoryRepository: CategoryRepository){}

  private readonly mockProducts = [
    {
      name: `product 1`,
      description: 'description product 1',
      price: 200,
      stock: 20,
      imgUrl: 'imagen 1 url',
      categoryName: 'Celulares'
    },
    {
      name: `product 2`,
      description: 'description product 2',
      price: 300,
      stock: 12,
      imgUrl: 'imagen 2 url',
      categoryName: 'Notebooks'
    },
    {
      name: `product 3`,
      description: 'description product 3',
      price: 500,
      stock: 10,
      imgUrl: 'imagen 3 url',
      categoryName: 'Camaras'
    },
    {
      name: `product 4`,
      description: 'description product 4',
      price: 500,
      stock: 10,
      imgUrl: 'imagen 4 url',
      categoryName: 'Tablets'
  },
  ]
  
  async addProductsSeeder() {
    for (const product of this.mockProducts) {
      const exists = await this.repository.findOne({ where: { name: product.name } });
      if (!exists) {
        const category = await this.categoryRepository.findOneByName(product.categoryName);
        if (!category) continue; // salteás si no existe la categoría
        
        const newProduct = this.repository.create({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          imgUrl: product.imgUrl,
          category: category,
        });
  
        await this.repository.save(newProduct);
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

  async createProduct(product: CreateProductDto) {
    const category = await this.categoryRepository.getCategoryById(product.categoryId);
    const exists = await this.repository.findOne({where: {name: product.name}});
    if(exists) throw new ConflictException('Ya existe un producto con ese nombre');
    
    const {categoryId, ...resto} = product;
    const newProduct = this.repository.create({...resto, category});
    await this.repository.save(newProduct); 
    return newProduct;
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

}
