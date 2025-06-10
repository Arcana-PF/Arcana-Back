import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderDetail } from './entities/orderDetail.entity';
import { OrderDetailProduct } from './entities/order-detail-product.entity';
@Injectable()
export class OrderDetailRepository {
  constructor(
    @InjectRepository(OrderDetail)
    private readonly orderDetailRepo: Repository<OrderDetail>,

    @InjectRepository(OrderDetailProduct)
    public readonly orderDetailProductRepository: Repository<OrderDetailProduct>,
  ) {}

  /**
   * Crear un nuevo OrderDetail con datos iniciales (por ejemplo, vacío)
   */
  createOrderDetail(data: Partial<OrderDetail>): OrderDetail {
    return this.orderDetailRepo.create(data);
  }

  /**
   * Guardar o actualizar un OrderDetail
   */
  async saveOrderDetail(orderDetail: OrderDetail): Promise<OrderDetail> {
    try {
      return await this.orderDetailRepo.save(orderDetail);
    } catch (error) {
      throw new InternalServerErrorException('Error al guardar el detalle de la orden');
    }
  }

  /**
   * Buscar un OrderDetail por ID con sus items y productos
   */
  async findOrderDetailById(id: string): Promise<OrderDetail> {
    const orderDetail = await this.orderDetailRepo.findOne({
      where: { id },
      relations: ['items', 'items.product'],
    });

    if (!orderDetail) {
      throw new NotFoundException(`Detalle de orden con ID ${id} no encontrado`);
    }

    return orderDetail;
  }

  /**
   * Eliminar un OrderDetail (opcional, si usas borrado lógico quizá no sea necesario)
   */
  async removeOrderDetail(id: string): Promise<void> {
    const result = await this.orderDetailRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Detalle de orden con ID ${id} no encontrado para eliminar`);
    }
  }
}
