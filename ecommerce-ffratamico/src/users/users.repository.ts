import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateUserDTO } from "./dto/create-user.dto";
import { UpdateUserDTO } from "./dto/update-user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "src/orders/entities/order.entity";
import { User } from "./entities/user.entity";
import { MockUsers } from "./mock/mock.users.data";

@Injectable()
export class UserRepository{

    constructor(@InjectRepository(User) private readonly repository: Repository<User>){}

    private readonly mockUsers = MockUsers;
    
    async getUsers(){
       const users = await this.repository.find();
       return users.map(({password, ...user}) => user);       
    }
    
    async getUsersWithPagination(page: number, limit: number) {
        const [users, total] = await this.repository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
        });

        const sanitizedUsers = users.map(({ password, ...user }) => user);

        return {
            total,
            page,
            limit,
            data: sanitizedUsers,
        };
    }

    async getById(id: string) {
        const user = await this.repository.findOne({where: {id}, relations: ['orders']})
        if(!user) throw new NotFoundException("El id del usuario no existe");
        
        delete user.password;

        return user;
    }
    
    async createUser(user: CreateUserDTO){
        const newUser = this.repository.create(user);
        await this.repository.save(newUser);
        return newUser;
    }

    async deleteUser(id: string) {
        const user = await this.repository.findOne({ where: { id } });

        if (!user) throw new NotFoundException('El usuario no existe');

        user.isActive = false; // ← Marcamos como inactivo

        await this.repository.save(user); // ← Guardamos el cambio

        return { message: `Usuario con ID ${id} desactivado correctamente.` };
    }

    async updateUser(id: string, updateUser: UpdateUserDTO) {
        // Buscamos solo usuarios activos
        const user = await this.repository.findOne({ where: { id, isActive: true } }); // ← agregado isActive: true

        if (!user) {
            throw new NotFoundException('El usuario no existe o está inactivo'); // ← mensaje más claro
        }

        Object.assign(user, updateUser); // ← nombre más representativo que "exists"

        await this.repository.save(user);

        return {
            message: `Usuario con ID ${id} actualizado correctamente.`,
            user: {
            id: user.id,
            name: user.name,
            email: user.email,
            address: user.address,
            phone: user.phone,
            isAdmin: user.isAdmin,
            isActive: user.isActive,
            }, // ← opcional: devolver los datos actualizados (sin password)
        };
    }

    async findOneByEmail(email: string) {
        const user = await this.repository.findOne({where: {email}})
        if(!user) return null;
        return user;
    }
}
