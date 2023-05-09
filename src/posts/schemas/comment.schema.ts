import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, now } from 'mongoose';

export type CommentDocument = HydratedDocument<Comment>;

@Schema()
export class Comment {
  @Prop()
  post_id: string;

  @Prop()
  commented_by: string;

  @Prop()
  comment: string;

  @Prop({ default: now() })
  created_at: Date;

  @Prop({ default: now() })
  updated_at: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
