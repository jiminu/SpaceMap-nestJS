import { Controller, Get, Query } from '@nestjs/common';
import { TLE } from './schemas/tles.schema';
import { TleService } from './tle.service';

@Controller('tle')
export class TleController {
  constructor(private readonly tleService: TleService) {}
  @Get('TLEbyNoradID')
  async getTLEbyNoradID(
    @Query('noradID') noradID: number,
  ): Promise<TLE> {
    return await this.tleService.getTLEbyNoradID(noradID);
  }
}
