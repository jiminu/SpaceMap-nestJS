import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TLEDocument = TLE & Document;

@Schema()
export class TLE {
  @Prop()
  catalogID: Number;
  @Prop()
  title_tle_line: String;
  @Prop()
  first_tle_line: String;
  @Prop()
  second_tle_line: String;
}

export const TLESchema = SchemaFactory.createForClass(TLE);
