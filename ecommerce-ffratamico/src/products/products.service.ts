import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsRepository } from './products.repository';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) { }

  getAll() {
    return this.productsRepository.getProducts();
  }

  getProductsWithPagination(page: number, limit: number) {
    return this.productsRepository.getProductsWithPagination(page, limit);
  }

  getProductById(id: string) {
    return this.productsRepository.getProductById(id);
  }

  createProduct(newProduct: CreateProductDto) {
    return this.productsRepository.createProduct(newProduct);
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
