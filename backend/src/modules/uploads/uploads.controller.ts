import {
  Controller,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { UploadsService } from './uploads.service';

const imageStorage = diskStorage({
  destination: './uploads',
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const imageFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|svg\+xml)$/)) {
    return cb(new Error('Only image files are allowed'), false);
  }
  cb(null, true);
};

const documentFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  if (
    !file.mimetype.match(
      /\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|csv)$/,
    )
  ) {
    return cb(new Error('Only document files (PDF, DOC, DOCX, CSV) are allowed'), false);
  }
  cb(null, true);
};

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  // ── Single image upload ──────────────────────────────────────────────
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: imageStorage,
      fileFilter: imageFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    this.uploadsService.validateImage(file);
    return this.uploadsService.processFile(file);
  }

  // ── Multiple image upload ────────────────────────────────────────────
  @Post('images')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: imageStorage,
      fileFilter: imageFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    this.uploadsService.validateFiles(files);
    return this.uploadsService.processFiles(files);
  }

  // ── Document upload ──────────────────────────────────────────────────
  @Post('document')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, 'doc-' + unique + path.extname(file.originalname));
        },
      }),
      fileFilter: documentFilter,
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  uploadDocument(@UploadedFile() file: Express.Multer.File) {
    this.uploadsService.validateDocument(file);
    return this.uploadsService.processFile(file);
  }

  // ── Delete uploaded file (requires auth) ────────────────────────────
  @Delete(':filename')
  @UseGuards(AuthGuard('jwt'))
  deleteFile(@Param('filename') filename: string) {
    return this.uploadsService.deleteFile(filename);
  }
}
