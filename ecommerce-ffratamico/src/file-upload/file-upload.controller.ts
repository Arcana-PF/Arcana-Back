import { Controller, HttpCode, HttpStatus, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { IdParamDTO } from 'src/OthersDtos/id-param.dto';
import { ImageUploadPipe } from './pipes/image-upload/image-upload.pipe';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('File Upload')
@Controller('files')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('uploadImage/:id')
  @UseGuards(AuthGuard) // Header de autorizacion
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@Param() param: IdParamDTO, @UploadedFile(new ImageUploadPipe()) file: Express.Multer.File){
    return this.fileUploadService.uploadFile(file, param.id)
  }
}
