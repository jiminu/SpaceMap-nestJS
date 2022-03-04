import { Controller, Get, Query } from '@nestjs/common';
import { PPDB } from './schemas/ppdbs.schema';
import { PpdbService } from './ppdb.service';

@Controller('ppdb')
export class PpdbController {
  constructor(private readonly ppdbService: PpdbService) {}
  @Get('ppdbWithinThreshold')
  async getPPDBbyIDwithinThreshold(
    @Query('noradID') noradID: number,
    @Query('threshold') threshold: number,
  ): Promise<PPDB[]> {
    return await this.ppdbService.getPPDB(noradID, threshold);
  }

  @Get()
  async getOnePPDB(): Promise<PPDB> {
    return await this.ppdbService.getOnePPDB();
  }

  @Get('ppdbByID')
  async getPPDBbyID(
    @Query('dbID') dbID: string
  ): Promise<PPDB>  {
    return await this.ppdbService.getPPDBbyID(dbID);
  }
}
