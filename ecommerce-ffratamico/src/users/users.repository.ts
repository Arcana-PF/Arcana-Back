import { Injectable } from "@nestjs/common";

@Injectable()
export class UserRepository{
  
    private users = [
        {
            id: 1,
            email: `fausto@mail.com`,
            name: `Fausto Fratamico`,
            password: `123456`,
            address: `Falsa 123`,
            phone: 456789,
            country: `Argentina`,
            city: `springfield`
        },
        {
            id: 2,
            email: `gisela@mail.com`,
            name: `Gisela torrez`,
            password: `456789`,
            address: `Falsa 345`,
            phone: 996574,
            country: `Argentina`,
            city: `shelbyville`
        },
        {
            id: 3,
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

    getById(id: number) {
        return this.users.find((user) => user.id === id);
    }

}
