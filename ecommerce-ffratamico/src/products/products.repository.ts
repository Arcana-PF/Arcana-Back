import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { v4 } from 'uuid';
import { ProductDTO } from './dto/product-dto';

@Injectable()
export class ProductsRepository {
  private products: ProductDTO[] = [
    {
      id: '1',
      name: `product 1`,
      description: 'description product 1',
      price: 200,
      stock: true,
      imgUrl: 'imagen 1 url',
    },
    {
        id: '2',
        name: `product 2`,
        description: 'description product 2',
        price: 300,
        stock: true,
        imgUrl: 'imagen 2 url',
    },
    {
        id: '3',
        name: `product 3`,
        description: 'description product 3',
        price: 500,
        stock: true,
        imgUrl: 'imagen 3 url',
    },
  ];

  getProducts() {
    return this.products;
  }

  getProductsWithPagination(page, limit) {
    const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        return this.products.slice(startIndex, endIndex).map((product) => product);
  }

  getProductById(id: string) {
    return this.products.find((product) => product.id === id);
  }

  createProduct(product: CreateProductDto) {
    const id = v4();
    const newProduct = {id, ...product};
    this.products.push(newProduct);
    return id;
  }
}
