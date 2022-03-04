import { Controller, Get, Req, Res, Session } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller('service')
export class SpaceMapServiceController {
  @Get('search')
  getSearch(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    return res.render('service/search', {
      title: 'Search Services',
      locals: res.locals,
      header: true,
      footer: true,
    });
  }

  @Get('optimization')
  getOptimization(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    return res.render('service/optimization', {
      title: 'Optimization Services',
      locals: res.locals,
      header: true,
      footer: true,
    });
  }

  @Get('decision')
  getDecision(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    return res.render('service/decision-making', {
      locals: res.locals,
      header: true,
      footer: true,
    });
  }

  @Get('launch')
  getLaunch(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    return res.render('service/launch', {
      title: 'Launch Services',
      locals: res.locals,
      header: true,
      footer: true,
    });
  }

  @Get('analytics')
  getAnalytics(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    return res.render('service/data-analytics', {
      title: 'Data Analytics Services',
      locals: res.locals,
      header: true,
      footer: true,
    });
  }
}
