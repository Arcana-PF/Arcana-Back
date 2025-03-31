import { Injectable } from '@nestjs/common';
import { UserRepository } from './users.repository';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}
  
  getAll() {
    return this.userRepository.getUsers();
  }
  
  getUsersWithPagination(page: number, limit: number) {
    return this.userRepository.getUsersWithPagination(page, limit);
  }

  getUserById(id: string) {
    return this.userRepository.getById(id);
  }
  
  createUser(newUser: CreateUserDTO) {
    return this.userRepository.createUser(newUser);
  }
  
  deleteUser(id: string) {
    return this.userRepository.deleteUser(id);
  }
  
  updateUser(id: string, updateUser: UpdateUserDTO) {
    return this.userRepository.updateUser(id, updateUser)
  }

  findOneByEmail(email: string){
    return this.userRepository.findOneByEmail(email)
  }

}
