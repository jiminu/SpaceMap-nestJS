import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PPDB, PPDBDocument } from './schemas/ppdbs.schema';

@Injectable()
export class PpdbService {
  constructor(@InjectModel(PPDB.name) private ppdbModel: Model<PPDBDocument>) {}
  async getPPDB(noradID: number, threshold: number): Promise<PPDB[]> {
    try {
      const result = await this.ppdbModel
        .find({
          $or: [
            {
              $and: [
                { primaryID: noradID },
                { minDistance: { $lt: threshold } },
              ],
            },
            {
              $and: [
                { secondaryID: noradID },
                { minDistance: { $lt: threshold } },
              ],
            },
          ],
        })
        .sort({ minDistance: 0 })
        .exec();
      return result;
    } catch (err) {
      console.log('error...');
    }
  }

  async getPPDBbyID(dbID: string): Promise<PPDB> {
    try {
      const result = await this.ppdbModel.findById(dbID).exec();
      return result;
    } catch (err) {
      console.log('errorr...')
    }
  }

  async getOnePPDB(): Promise<PPDB> {
    try {
      const result = await this.ppdbModel.findOne().exec();
      return result;
    } catch (err) {
      console.log('error...');
    }
  }
}
