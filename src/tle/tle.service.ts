import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TLE, TLEDocument } from './schemas/tles.schema';

@Injectable()
export class TleService {
    constructor(@InjectModel(TLE.name) private tleModel: Model<TLEDocument>) { }
    async getTLEbyNoradID(noradID: number): Promise<TLE>{
        try {
            const result = await this.tleModel.findOne({
                catalogID: { $in: noradID },
            }).exec();
            return result;
        } catch (err) {
            console.log('err');
        }
    }
}
