import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadsService {
  getUploadHealth() {
    return { status: 'ready' };
  }
}
