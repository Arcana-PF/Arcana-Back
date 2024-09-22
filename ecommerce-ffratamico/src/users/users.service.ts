import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository){}

  GetAll() {   
    return this.userRepository.getUsers();
  }
  
  GetUSerById(id: number) {
    return this.userRepository.getById(id);
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }
  
  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
