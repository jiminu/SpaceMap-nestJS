import {
  Controller,
  Get,
  Post,
  Query,
  Render,
  Req,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';
import { LocalAuthGuard } from './auth/local-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('')
  getHome(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
    @Query('section') section: string,
  ) {
    return res.render('index', {
      locals: res.locals,
      header: true,
      headerClass: 'main',
      footer: true,
      section: section,
    });
  }

  @Get('intro')
  getIntro(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    return res.render('intro');
  }

  @Get('about')
  @Render('about')
  getAbout(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    return { title: 'About', locals: res.locals };
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Req() req: Request) {
    return req.user;
  }

  @Get('company')
  async getCompany(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    return res.render('company', {
      title: 'company',
      locals: res.locals,
      header: true,
      footer: true,
    });
  }
}
