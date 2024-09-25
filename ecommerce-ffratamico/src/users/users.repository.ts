import { Injectable } from "@nestjs/common";
import { v4 } from "uuid";

@Injectable()
export class UserRepository{
  
    private users: UserDTO[] = [
        {
            id: '1',
            email: `fausto@mail.com`,
            name: `Fausto Fratamico`,
            password: `123456`,
            address: `Falsa 123`,
            phone: 456789,
            country: `Argentina`,
            city: `springfield`
        },
        {
            id: '2',
            email: `gisela@mail.com`,
            name: `Gisela torrez`,
            password: `456789`,
            address: `Falsa 345`,
            phone: 996574,
            country: `Argentina`,
            city: `shelbyville`
        },
        {
            id: '3',
            email: `valentino@mail.com`,
            name: `Valentino Sparvoli`,
            password: `789123`,
            address: `Falsa 789`,
            phone: 5589321,
            country: `Argentina`,
            city: `Bronson`
        },
    ];

    getUsers(){
       const users = this.users.map(({ password, ...user }) => user);       
        return users;
    }

    getById(id: string) {
        return this.users.find((user) => user.id === id);
    }

    createUser(user: CreaateUserDTO){
        const {email, name, password, address, phone, country, city} = user;
        const id = v4()

        const newUser: UserDTO= {
            id,
            email,
            name,
            password,
            address,
            phone,
            country,
            city
        }
        this.users.push(newUser);
        return id;

    }

    deleteUser(id: string){
        this.users = this.users.filter(user => user.id !== id)
        return id;
    }

    updateUser(id: string, updateUser: UpdateUserDTO){
        const user = this.getById(id);
        const newupdateUser = Object.assign(user, updateUser);
        this.users = this.users.map(user => user.id === id ? newupdateUser : user);
        return id;
    }

}
