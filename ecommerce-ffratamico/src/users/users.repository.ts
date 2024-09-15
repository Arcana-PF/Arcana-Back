import { Injectable } from "@nestjs/common";

@Injectable()
export class UserRepository{
    private users = [
        {
            id: 1,
            name: `Fausto Fratamico`,
            email: `fausto@mail.com`
        },
        {
            id: 2,
            name: `Gisela Torrez`,
            email: `gisela@mail.com`
        },
        {
            id: 3,
            name: `Valentino Sparvoli`,
            email: `valentino@mail.com`
        }
    ];

    getUsers(){
        return this.users;
    }
}