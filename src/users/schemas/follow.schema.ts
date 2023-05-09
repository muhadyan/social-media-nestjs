import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FollowDocument = HydratedDocument<Follow>;

@Schema()
export class Follow {
  @Prop()
  user_id: string;

  @Prop()
  follow: string;
}

export const FollowSchema = SchemaFactory.createForClass(Follow);
