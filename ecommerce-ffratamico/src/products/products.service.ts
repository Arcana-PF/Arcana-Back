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

  removeProduct(id: string) {
      return this.productsRepository.deleteProduct(id);
  }

  update(id: string, updateProduct: UpdateProductDto) {
    return this.productsRepository.updateProduct(id, updateProduct);
  }

}
