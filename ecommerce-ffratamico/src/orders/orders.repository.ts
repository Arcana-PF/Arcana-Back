import { 
  ConflictException, 
  Injectable, 
  NotFoundException,
  InternalServerErrorException 
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "./entities/order.entity";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { ProductsRepository } from "src/products/products.repository";
import { OrderDetailRepository } from "./orderDetail.repository";
import { Product } from "src/products/entities/product.entity";
import { UserRepository } from "../users/users.repository";
import { OrderStatus } from "./enums/order-status.enum";

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectRepository(Order) 
    private readonly repository: Repository<Order>,
    private readonly userRepository: UserRepository,
    private readonly productRepository: ProductsRepository,
    private readonly orderDetailRepository: OrderDetailRepository
  ) {}
  
  /**
     * Obtiene todas las órdenes activas
     * @returns Lista de órdenes con relaciones
     */
    async findAll() {
        try {
            return await this.repository.find({
                where: { isActive: true }, // Solo órdenes activas
                relations: {
                    user: true,
                    orderDetail: {
                        products: true
                    }
                },
                order: {
                    date: 'DESC' // Orden más reciente primero
                }
            });
        } catch (error) {
            throw new InternalServerErrorException('Error al obtener órdenes');
        }
    }
  
    async createDatabaseOrder(orderData: CreateOrderDto): Promise<Order> {
        const user = await this.userRepository.getById(orderData.userId);
        const productsToBuy: Product[] = [];
        let total = 0;

        for (const item of orderData.products) {
        const product = await this.productRepository.getProductById(item.id);
        if(product.stock <= 0) continue;

        product.stock -= 1;
        await this.productRepository.updateProduct(product.id, {stock: product.stock});

        productsToBuy.push(product);
        total += Number(product.price);
        }

        if(productsToBuy.length === 0) {
        throw new ConflictException('Ningún producto tiene stock disponible');
        }

        const orderDetail = this.orderDetailRepository.createOrderDetail({
        price: total, 
        products: productsToBuy
        });
        await this.orderDetailRepository.saveOrderDetail(orderDetail);

        const newOrder = this.repository.create({
        user,
        orderDetail,
        status: OrderStatus.PENDING
        });

        return this.repository.save(newOrder);
    }
  
    async updateOrderWithPayment(
        orderId: string,
        updateData: {
        status: OrderStatus;
        paypalData?: {
            captureId: string;
            payerEmail: string;
            fullResponse: any;
        };
        }
    ): Promise<Order> {
        const order = await this.repository.findOne({
        where: { id: orderId },
        relations: ['orderDetail', 'orderDetail.products', 'user']
        });

        if (!order) {
        throw new NotFoundException(`Orden ${orderId} no encontrada`);
        }

        order.status = updateData.status;
        
        if (updateData.paypalData) {
        order.paypalData = {
            captureId: updateData.paypalData.captureId,
            payerEmail: updateData.paypalData.payerEmail,
            fullResponse: updateData.paypalData.fullResponse
        };
        }

        return this.repository.save(order);
    }
    /**
     * Busca una orden activa por ID
     * @param id UUID de la orden
     * @returns Orden con detalles
     */
    async findOne(id: string) {
        try {
            const order = await this.repository.findOne({
                where: { 
                    id, 
                    isActive: true // Solo si está activa
                },
                relations: {
                    user: true,
                    orderDetail: {
                        products: true
                    }
                }
            });
            
            if (!order) {
                throw new NotFoundException(`Orden activa con ID ${id} no encontrada`);
            }

            return order;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException('Error al buscar la orden');
        }
    }

    /**
     * Actualiza una orden (solo campos permitidos)
     * @param id UUID de la orden
     * @param updateOrderDto Datos de actualización
     * @returns Orden actualizada
     */
    async update(id: string, updateOrderDto: UpdateOrderDto) {
        try {
            const order = await this.repository.findOneBy({ 
                id,
                isActive: true // Solo actualiza órdenes activas
            });
            
            if (!order) {
                throw new NotFoundException(`Orden activa con ID ${id} no encontrada`);
            }

            // Solo permite actualizar el usuario asociado
            if (updateOrderDto.userId) {
                const user = await this.userRepository.getById(updateOrderDto.userId);
                if (!user) throw new NotFoundException('Usuario no encontrado');
                order.user = user;
            }

            await this.repository.save(order);
            return {
                ...order,
                message: 'Orden actualizada correctamente'
            };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException('Error al actualizar la orden');
        }
    }

    /**
     * Realiza borrado lógico (desactiva la orden)
     * @param id UUID de la orden
     * @returns Confirmación del borrado
     */
    async remove(id: string) {
        try {
            const order = await this.repository.findOne({
                where: { id },
                relations: ['orderDetail']
            });

            if (!order) {
                throw new NotFoundException(`Orden con ID ${id} no encontrada`);
            }

            // Borrado lógico (no elimina físicamente)
            order.isActive = false;
            await this.repository.save(order);
            
            return { 
                message: 'Orden desactivada (borrado lógico)',
                orderId: id,
                isActive: false,
                dateDeleted: new Date() // Opcional: registrar cuándo se desactivó
            };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException('Error al desactivar la orden');
        }
    }

    /**
     * Obtiene órdenes incluyendo las inactivas (para admins)
     * @returns Todas las órdenes sin filtrar
     */
    async findAllWithInactive() {
        try {
            return await this.repository.find({
                withDeleted: true, // Incluye órdenes desactivadas
                relations: ['user', 'orderDetail.products']
            });
        } catch (error) {
            throw new InternalServerErrorException('Error al obtener el historial completo');
        }
    }
    async getFullOrderDetails(orderId: string): Promise<Order> {
        const order = await this.repository.findOne({
        where: { id: orderId },
        relations: [
            'user', 
            'orderDetail', 
            'orderDetail.products'
        ]
        });

        if (!order) {
        throw new NotFoundException(`Orden ${orderId} no encontrada`);
        }

        return order;
    }

    async updateOrderStatus(
        orderId: string, 
        status: OrderStatus
    ): Promise<void> {
        await this.repository.update(orderId, { status });
    }
}