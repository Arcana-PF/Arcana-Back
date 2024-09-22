import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductsRepository {
  private products = [
    {
      id: 1,
      name: `product 1`,
      description: 'description product 1',
      price: 200,
      stock: true,
      imgUrl: 'imagen 1 url',
    },
    {
        id: 2,
        name: `product 2`,
        description: 'description product 2',
        price: 300,
        stock: true,
        imgUrl: 'imagen 2 url',
    },
    {
        id: 3,
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
}
