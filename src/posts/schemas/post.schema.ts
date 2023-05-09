import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, now } from 'mongoose';

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class Post {
  @Prop()
  user_id: string;

  @Prop()
  title: string;

  @Prop()
  caption: string;

  @Prop()
  photo: string;

  @Prop()
  likes: number;

  @Prop()
  comments: number;

  @Prop({ default: now() })
  created_at: Date;

  @Prop({ default: now() })
  updated_at: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);
