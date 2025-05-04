import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateUserDTO } from "./dto/create-user.dto";
import { UpdateUserDTO } from "./dto/update-user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { Order } from "src/orders/entities/order.entity";

@Injectable()
export class UserRepository{

    constructor(@InjectRepository(User) private readonly repository: Repository<User>){}

    private readonly mockUsers =[
        {
            email: `fausto@mail.com`,
            name: `Fausto Fratamico`,
            password: `123456`,
            address: `Falsa 123`,
            phone: 456789,
            country: `Argentina`,
            city: `springfield`,
            orders: []
        },
        {
            email: `gisela@mail.com`,
            name: `Gisela torrez`,
            password: `456789`,
            address: `Falsa 345`,
            phone: 996574,
            country: `Argentina`,
            city: `shelbyville`,
            orders: []
        },
        {
            email: `valentino@mail.com`,
            name: `Valentino Sparvoli`,
            password: `789123`,
            address: `Falsa 789`,
            phone: 5589321,
            country: `Argentina`,
            city: `Bronson`,
            orders: []
        },
    ];

    async addUsers(){
        for(const users of this.mockUsers){
            const exists = await this.repository.findOne({where: {email: users.email}});
            if(!exists){await this.repository.save(users)}
        }
    }
    
    async getUsers(){
       const users = await this.repository.find();
       return users.map(({password, ...user}) => user);       
    }
    
    async getUsersWithPagination(page: number, limit: number) {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const users = await this.repository.find();
        return users.slice(startIndex, endIndex).map(({ password, ...user }) => user);
    }

    async getByIdForOrders(id: string) {
        const user = await this.repository.findOne({where: {id}})
        if(!user) throw new NotFoundException("El id del usuario no existe");
        return user;
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

    async deleteUser(id: string){
        const exists = await this.repository.findOne({where:{id}});
        if(!exists) throw new NotFoundException('el usuario no existe');
        await this.repository.delete(id);
        return id;
    }

    async updateUser(id: string, updateUser: UpdateUserDTO){
        const exists = await this.repository.findOne({where:{id}})
        if(!exists) throw new NotFoundException('el usuario no existe');
        const updatedUser = Object.assign(exists, updateUser);
        await this.repository.save(updatedUser);
        return id;
    }

    async findOneByEmail(email: string) {
        const user = await this.repository.findOne({where: {email}})
        if(!user) return null;
        return user;
    }
}
