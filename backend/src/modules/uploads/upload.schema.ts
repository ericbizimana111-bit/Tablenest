import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type UploadDocument = Upload & Document;

/** Every stored file, who uploaded it and where it lives. Entities reference files by `url`. */
@Schema({ timestamps: true })
export class Upload {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  ownerId: Types.ObjectId;

  /** Storage key (server-generated file name). Never derived from client input. */
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ required: true, unique: true })
  url: string;

  @Prop({ required: true })
  mimetype: string;

  @Prop({ required: true })
  size: number;

  @Prop({ type: String, default: null })
  originalName: string | null;

  @Prop({ default: 'local' })
  driver: string;
}

export const UploadSchema = SchemaFactory.createForClass(Upload);
UploadSchema.index({ ownerId: 1, createdAt: -1 }, { name: 'upload_owner' });
