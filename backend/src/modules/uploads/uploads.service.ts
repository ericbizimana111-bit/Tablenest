import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface UploadResult {
  url: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
}

@Injectable()
export class UploadsService {
  private readonly uploadsDir = path.join(process.cwd(), 'uploads');

  private readonly allowedImageTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ];

  private readonly allowedDocumentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/csv',
  ];

  private readonly maxImageSize = 5 * 1024 * 1024; // 5MB
  private readonly maxDocumentSize = 10 * 1024 * 1024; // 10MB
  private readonly maxFilesPerRequest = 10;

  private ensureUploadsDir() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  validateImage(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    if (!this.allowedImageTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type: ${file.mimetype}. Allowed types: ${this.allowedImageTypes.join(', ')}`,
      );
    }
    if (file.size > this.maxImageSize) {
      throw new BadRequestException(
        `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max size: ${this.maxImageSize / 1024 / 1024}MB`,
      );
    }
  }

  validateDocument(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    if (!this.allowedDocumentTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type: ${file.mimetype}. Allowed types: ${this.allowedDocumentTypes.join(', ')}`,
      );
    }
    if (file.size > this.maxDocumentSize) {
      throw new BadRequestException(
        `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max size: ${this.maxDocumentSize / 1024 / 1024}MB`,
      );
    }
  }

  validateFiles(files: Express.Multer.File[]): void {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }
    if (files.length > this.maxFilesPerRequest) {
      throw new BadRequestException(
        `Too many files: ${files.length}. Max allowed: ${this.maxFilesPerRequest}`,
      );
    }
    for (const file of files) {
      this.validateImage(file);
    }
  }

  processFile(file: Express.Multer.File): UploadResult {
    this.ensureUploadsDir();
    return {
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  processFiles(files: Express.Multer.File[]): UploadResult[] {
    this.ensureUploadsDir();
    return files.map((file) => this.processFile(file));
  }

  async deleteFile(filename: string): Promise<{ deleted: boolean }> {
    const filePath = path.join(this.uploadsDir, filename);

    // Prevent path traversal attacks
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(this.uploadsDir)) {
      throw new BadRequestException('Invalid filename');
    }

    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('File not found');
    }

    fs.unlinkSync(filePath);
    return { deleted: true };
  }

  getUploadsBaseUrl(): string {
    return '/uploads';
  }
}
