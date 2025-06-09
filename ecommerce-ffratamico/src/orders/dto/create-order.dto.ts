// src/orders/dto/create-order.dto.ts
export class ProductOrderDto {
  productId: string;
  quantity: number; // Nueva propiedad
}

export class CreateOrderDto {
  userId: string;
  products: ProductOrderDto[];
}