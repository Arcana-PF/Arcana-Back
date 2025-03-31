import { Injectable } from "@nestjs/common";
import { v4 } from "uuid";
import { CreateUserDTO } from "./dto/create-user.dto";
import { UpdateUserDTO } from "./dto/update-user.dto";
import { UserDTO } from "./dto/user.dto";

@Injectable()
export class UserRepository{
    
    private users: UserDTO[] = [
        {
            id: '1',
            email: `fausto@mail.com`,
            name: `Fausto Fratamico`,
            password: `123456`,
            address: `Falsa 123`,
            phone: '456789',
            country: `Argentina`,
            city: `springfield`
        },
        {
            id: '2',
            email: `gisela@mail.com`,
            name: `Gisela torrez`,
            password: `456789`,
            address: `Falsa 345`,
            phone: '996574',
            country: `Argentina`,
            city: `shelbyville`
        },
        {
            id: '3',
            email: `valentino@mail.com`,
            name: `Valentino Sparvoli`,
            password: `789123`,
            address: `Falsa 789`,
            phone: '5589321',
            country: `Argentina`,
            city: `Bronson`
        },
    ];
    
    getUsers(){
        const users = this.users.map(({ password, ...user }) => user);       
        return users;
    }
    
    getUsersWithPagination(page: number, limit: number) {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        return this.users.slice(startIndex, endIndex).map(({ password, ...user }) => user);
    }

    getById(id: string) {
        return this.users.find((user) => user.id === id);
    }
    
    createUser(user: CreateUserDTO){
        const id = v4();
        const newUser = {id, ...user};
        this.users.push(newUser);
        return id;

    }

    deleteUser(id: string){
        this.users = this.users.filter(user => user.id !== id)
        return id;
    }

    updateUser(id: string, updateUser: UpdateUserDTO){

        const userIndex = this.users.findIndex(user => user.id === id);
        if (userIndex === -1) return null;

        const updatedUser = { ...this.users[userIndex], ...updateUser };
        this.users[userIndex] = updatedUser;
        return id;
    }

    findOneByEmail(email: string) {
        return this.users.find(user => user.email === email);
    }
}
