import {
  Controller,
  Get,
  Req,
  Res,
  Session,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { AuthenticatedFilter } from '../auth/authenticated.filter';

@Controller('cesium')
export class CesiumController {
  @Get()
  getIndex(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    return res.render('cesium/index', {
      locals: res.locals,
      header: true,
      footer: true,
    });
  }

  // @UseGuards(AuthenticatedGuard)
  // @UseFilters(AuthenticatedFilter)
  @Get('q1')
  getQ1(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    return res.render('cesium/q1', {
      locals: res.locals,
      header: true,
      footer: true,
    });
  }

  // @UseGuards(AuthenticatedGuard)
  // @UseFilters(AuthenticatedFilter)
  @Get('q2')
  getQ2(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    return res.render('cesium/q2', {
      locals: res.locals,
      header: true,
      footer: true,
    });
  }

  // @UseGuards(AuthenticatedGuard)
  // @UseFilters(AuthenticatedFilter)
  @Get('q3')
  getQ3(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    return res.render('cesium/q3', {
      locals: res.locals,
      header: true,
      footer: true,
    });
  }

  // @UseGuards(AuthenticatedGuard)
  // @UseFilters(AuthenticatedFilter)
  @Get('q4')
  getQ4(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    return res.render('cesium/q4', {
      locals: res.locals,
      header: true,
      footer: true,
    });
  }

  // @UseGuards(AuthenticatedGuard)
  // @UseFilters(AuthenticatedFilter)
  @Get('q5')
  getQ5(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    return res.render('cesium/q5', {
      locals: res.locals,
      header: true,
      footer: true,
    });
  }

  // @UseGuards(AuthenticatedGuard)
  // @UseFilters(AuthenticatedFilter)
  @Get('q-star')
  getQStar(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    return res.render('cesium/q-star', {
      locals: res.locals,
      header: true,
      footer: true,
    });
  }

  // @UseGuards(AuthenticatedGuard)
  // @UseFilters(AuthenticatedFilter)
  @Get('detail')
  getDetail(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    return res.render('cesium/detail', {
      locals: res.locals,
      header: true,
      footer: true,
    });
  }

  // @UseGuards(AuthenticatedGuard)
  // @UseFilters(AuthenticatedFilter)
  @Get('ppdb')
  getPPDB(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    return res.json();
  }
}
