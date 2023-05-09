import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LikeDocument = HydratedDocument<Like>;

@Schema()
export class Like {
  @Prop()
  post_id: string;

  @Prop()
  liked_by: string;
}

export const LikeSchema = SchemaFactory.createForClass(Like);
