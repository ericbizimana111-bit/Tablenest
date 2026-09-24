import {
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  Post,
  Query,
  Request,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { MAX_FILES_PER_REQUEST, UploadsService } from './uploads.service';
import { PaginationQueryDto, pageParams } from '../../common/dto/pagination.dto';

export const maxUploadBytes = () => Number(process.env.MAX_UPLOAD_MB || 5) * 1024 * 1024;

// Files are held in memory (bounded by the size limit) so they can be inspected before anything
// touches the disk. Multer turns an oversized file into a 413 response.
const multerOptions = () => ({ storage: memoryStorage(), limits: { fileSize: maxUploadBytes(), files: MAX_FILES_PER_REQUEST } });

@Controller('uploads')
@UseGuards(AuthGuard('jwt'))
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file', multerOptions()))
  uploadImage(@Request() req, @UploadedFile() file: Express.Multer.File) {
    return this.uploadsService.storeImage(req.user, file);
  }

  @Post('images')
  @UseInterceptors(FilesInterceptor('files', MAX_FILES_PER_REQUEST, multerOptions()))
  uploadImages(@Request() req, @UploadedFiles() files: Express.Multer.File[]) {
    return this.uploadsService.storeImages(req.user, files);
  }

  @Get('mine')
  mine(@Request() req, @Query() q: PaginationQueryDto) {
    const { page, limit } = pageParams(q, 24);
    return this.uploadsService.listMine(req.user, page, limit);
  }

  /** `:id` is the upload id or its file name. `force=true` (admins only) detaches it everywhere first. */
  @Delete(':id')
  delete(@Request() req, @Param('id') id: string, @Query('force', new ParseBoolPipe({ optional: true })) force?: boolean) {
    return this.uploadsService.delete(req.user, id, !!force);
  }
}
