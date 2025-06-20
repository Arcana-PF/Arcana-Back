import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDTO } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { IdParamDTO } from 'src/OthersDtos/id-param.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsAdminGuard } from 'src/auth/guard/is-admin/isAdmin.guard';
import { IsUserGuard } from 'src/auth/guard/is-user/is-user.guard';
import { Auth0Guard } from 'src/auth/guard/auth0/auth0.guard';

@ApiBearerAuth()
@ApiTags('Users')
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAllUsers() {
    return await this.usersService.getAll();
  }

  @Get('page')
  async getUsersWithPagination(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 5,
  ) {
    return await this.usersService.getUsersWithPagination(page, limit);
  }

  @Get(':id')
  async getUserById(@Param() param: IdParamDTO) {
    return await this.usersService.getUserById(param.id);
  }

  @Delete(':id')
  async deleteUser(@Param() param: IdParamDTO) {
    return await this.usersService.deleteUser(param.id);
  }

  @Put(':id')
  async updateUser(
    @Param() param: IdParamDTO,
    @Body() updateUser: UpdateUserDTO,
  ) {
    return await this.usersService.updateUser(param.id, updateUser);
  }
}
