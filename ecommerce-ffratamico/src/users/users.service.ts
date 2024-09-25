import { Injectable } from '@nestjs/common';
import { UserRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  GetAll() {
    return this.userRepository.getUsers();
  }

  GetUSerById(id: string) {
    return this.userRepository.getById(id);
  }

  createUser(newUser: CreaateUserDTO) {
    return this.userRepository.createUser(newUser);
  }

  deleteUser(id) {
    return this.userRepository.deleteUser(id);
  }

  updateUser(id: string, updateUser: UpdateUserDTO) {
    return this.userRepository.updateUser(id, updateUser)
  }
}
