import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PPDBDocument = PPDB & Document;

@Schema()
export class PPDB {
  @Prop()
  primaryID: number;
  @Prop()
  secondaryID: number;
  @Prop()
  minDistance: number;
  @Prop()
  TCATarget: number;
  @Prop()
  TCAStart: number;
  @Prop()
  TCAEnd: number;
  @Prop()
  year: number;
  @Prop()
  mon: number;
  @Prop()
  day: number;
  @Prop()
  hour: number;
  @Prop()
  min: number;
  @Prop()
  sec: number;
  @Prop()
  probability: number;
}

export const PPDBSchema = SchemaFactory.createForClass(PPDB);
