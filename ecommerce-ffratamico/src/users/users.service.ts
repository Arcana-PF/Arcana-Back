import { Injectable } from '@nestjs/common';
import { UserRepository } from './users.repository';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  
  constructor(private readonly userRepository: UserRepository) {}

  async addUsers(){
    return await this.userRepository.addUsers();
  }
  
  async getAll() {
    return await this.userRepository.getUsers();
  }
  
  async getUsersWithPagination(page: number, limit: number) {
    return await this.userRepository.getUsersWithPagination(page, limit);
  }

  async getUserById(id: string) {
    return await this.userRepository.getById(id);
  }
  
  async createUser(newUser: CreateUserDTO) {
    return await this.userRepository.createUser(newUser);
  }
  
  async deleteUser(id: string) {
    return await this.userRepository.deleteUser(id);
  }
  
  async updateUser(id: string, updateUser: UpdateUserDTO) {
    return await this.userRepository.updateUser(id, updateUser)
  }
}
