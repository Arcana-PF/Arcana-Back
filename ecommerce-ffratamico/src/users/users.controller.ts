import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  GetAll(@Res() response: Response) {
    response.status(200).send(this.usersService.GetAll());
  }

  @Get(':id')
  GetUserById(@Param('id') id: string, @Res() response: Response) {
    response.status(200).send(this.usersService.GetUSerById(id));
  }

  @Post()
  createUser(@Body() newUser: CreaateUserDTO, @Res() response: Response) {
    response.status(201).send(this.usersService.createUser(newUser));
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string, @Res() response: Response) {
    response.status(200).send(this.usersService.deleteUser(id));
  }

  @Put(":id")
  updateUser(@Param("id") id: string, @Body() updateUser: UpdateUserDTO, @Res() response: Response){
    response.status(200).send(this.usersService.updateUser(id, updateUser))
  }
}
