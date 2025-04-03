import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Res,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Response } from 'express';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard) // Header de autorizacion
  getAllUsers(@Res() response: Response) {
    response.status(200).send(this.usersService.getAll());
  }

  @Get('page')
  @UseGuards(AuthGuard) // Header de autorizacion
  getUsersWithPagination(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 5,
  ) {
    return this.usersService.getUsersWithPagination(page, limit);
  }

  @Get(':id')
  @UseGuards(AuthGuard) // Header de autorizacion
  getUserById(@Param('id') id: string, @Res() response: Response) {
    response.status(200).send(this.usersService.getUserById(id));
  }

  @Post()
  createUser(@Body() newUser: CreateUserDTO, @Res() response: Response) {
    response.status(201).send(this.usersService.createUser(newUser));
  }

  @Delete(':id')
  @UseGuards(AuthGuard) // Header de autorizacion
  deleteUser(@Param('id') id: string, @Res() response: Response) {
    response.status(200).send(this.usersService.deleteUser(id));
  }

  @Put(':id')
  @UseGuards(AuthGuard) // Header de autorizacion
  updateUser(
    @Param('id') id: string,
    @Body() updateUser: UpdateUserDTO,
    @Res() response: Response,
  ) {
    response.status(200).send(this.usersService.updateUser(id, updateUser));
  }
}
