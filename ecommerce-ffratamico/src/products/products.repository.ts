import { Injectable } from "@nestjs/common";

@Injectable()
export class ProductsRepository{
    private products = [
        {
            id: 1,
            name: `product 1`,
            price: 200
        },
        {
            id: 2,
            name: `product 2`,
            price: 300
        },
        {
            id: 3,
            name: `product 3`,
            price: 400
        },
      
    ];

    getProducts(){
        return this.products;
    }
}