import { Controller, HttpCode, HttpStatus, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { IdParamDTO } from 'src/OthersDtos/id-param.dto';
import { ImageUploadPipe } from './pipes/image-upload/image-upload.pipe';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { IsAdminGuard } from 'src/auth/guard/is-admin/isAdmin.guard';

@ApiBearerAuth()
@ApiTags('File Upload')
@Controller('files')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('uploadImage/:id')
  @UseGuards(AuthGuard, IsAdminGuard) // Header de autorizacion
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file', {limits: {fileSize: 1 * 1024 * 1024}}))
  @ApiConsumes('multipart/form-data')
  @ApiBody({schema: {type: 'object', properties: { file: { type: 'string', format: 'binary'}}}})
  uploadProductImage(@Param() param: IdParamDTO, @UploadedFile(new ImageUploadPipe()) file: Express.Multer.File){
    return this.fileUploadService.uploadProductImage(file, param.id)
  }
}