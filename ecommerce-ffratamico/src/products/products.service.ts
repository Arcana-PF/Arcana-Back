import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsRepository } from './products.repository';

@Injectable()
export class ProductsService {
  
  constructor(private readonly productsRepository: ProductsRepository) { }

  async getAll() {
    return await this.productsRepository.getProducts();
  }

  async getProductsWithPagination(page: number, limit: number) {
    return await this.productsRepository.getProductsWithPagination(page, limit);
  }

  async getProductById(id: string) {
    return await this.productsRepository.getProductById(id);
  }

  async createProduct(newProduct: CreateProductDto) {
    return await this.productsRepository.createProduct(newProduct);
  }

  async addProductsSeeder() {
    return await this.productsRepository.addProductsSeeder();
  }

  async removeProduct(id: string) {
    return await this.productsRepository.deleteProduct(id);
  }

  async update(id: string, updateProduct: UpdateProductDto) {
    return await this.productsRepository.updateProduct(id, updateProduct);
  }

  rateProduct(id: any, id1: string, score: number) {
    throw new Error('Method not implemented.');
  }

}
