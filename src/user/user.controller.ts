import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  Session,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { LocalAuthGuard } from '../auth/local-auth.guard';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { FindUsernameDto } from './dto/find-username.dto';
import { FindPasswordDto } from './dto/find-password.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserRequestInterface } from '../interfaces/user.request.interface';
import { AuthenticatedFilter } from '../auth/authenticated.filter';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('create')
  async createUser(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
    @Body() createUserDto: CreateUserDto,
  ) {
    if (!createUserDto.firstname) {
      return res.json({
        result: false,
        error: 'Enter firstname',
      });
    }
    if (!createUserDto.lastname) {
      return res.json({
        result: false,
        error: 'Enter lastname',
      });
    }
    if (!createUserDto.affiliation) {
      return res.json({
        result: false,
        error: 'Enter affiliation',
      });
    }
    if (!createUserDto.username) {
      return res.json({
        result: false,
        error: 'Enter ID',
      });
    }
    if (!createUserDto.email) {
      return res.json({
        result: false,
        error: 'Enter email',
      });
    }
    if (!createUserDto.password) {
      return res.json({
        result: false,
        error: 'Enter password',
      });
    }
    if (!createUserDto.passwordConfirm) {
      return res.json({
        result: false,
        error: 'Enter confirm password',
      });
    }
    if (createUserDto.password !== createUserDto.passwordConfirm) {
      return res.json({
        result: false,
        error: 'Password and Confirm Password do not match',
      });
    }

    const user = await this.userService.findOne(createUserDto.username);
    if (user) {
      return res.json({
        result: false,
        error: 'The username is exist',
      });
    }

    await this.userService.addUser(createUserDto);

    return res.json({
      result: true,
    });
  }

  @Post('update')
  async updateUser(
    @Req() req: UserRequestInterface,
    @Res() res: Response,
    @Session() session: Record<string, any>,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (!updateUserDto.firstname) {
      return res.json({
        result: false,
        error: 'Enter firstname',
      });
    }
    if (!updateUserDto.lastname) {
      return res.json({
        result: false,
        error: 'Enter lastname',
      });
    }
    if (!updateUserDto.affiliation) {
      return res.json({
        result: false,
        error: 'Enter affiliation',
      });
    }
    if (updateUserDto.password) {
      if (!updateUserDto.password) {
        return res.json({
          result: false,
          error: 'Enter password',
        });
      }
      if (!updateUserDto.passwordConfirm) {
        return res.json({
          result: false,
          error: 'Enter confirm password',
        });
      }
      if (updateUserDto.password !== updateUserDto.passwordConfirm) {
        return res.json({
          result: false,
          error: 'Password and Confirm Password do not match',
        });
      }
    }

    updateUserDto.username = req.user.username;

    await this.userService.updateUser(updateUserDto);

    return res.json({
      result: true,
    });
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async postLogin(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    req.login(req.user, function (err) {
      if (err) {
        // If req.user is null, it gets error too.
        session.errors = ['Username or password is incorrect'];
        return res.json({ result: false, error: session.errors[0] });
      } else {
        return res.json({ result: true });
      }
    });
  }

  @UseGuards(AuthenticatedGuard)
  @UseFilters(AuthenticatedFilter)
  @Get('logout')
  getLogout(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    req.logout();
    return res.redirect('/');
  }

  @UseGuards(AuthenticatedGuard)
  @UseFilters(AuthenticatedFilter)
  @Get('my-page')
  async getMyPage(
    @Req() req: UserRequestInterface,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    const { password, ...user } = await this.userService.findOne(
      req.user.username,
    );
    const isGoogleUser = user.username.search('@') !== -1;

    return res.render('user/my-page', {
      locals: res.locals,
      header: true,
      footer: true,
      user: user,
      isGoogleUser: isGoogleUser,
      isUser: !isGoogleUser,
    });
  }

  @Get('create')
  getList(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    return res.render('user/create');
  }

  @Post('session')
  async postSession(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    if (req.user) {
      return res.json({ result: true });
    } else {
      return res.json({ result: false });
    }
  }

  @Post('find/username')
  async postFindUsername(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
    @Body() findUsername: FindUsernameDto,
  ) {
    const user = await this.userService.findOneByEmail(findUsername.email);

    if (
      user &&
      user.firstname === findUsername.firstname &&
      user.lastname === findUsername.lastname
    ) {
      await this.userService.sendUsernameToEmail(
        findUsername.email,
        findUsername.firstname,
        findUsername.lastname,
      );
    }

    return res.json({ result: true });
  }

  @Post('find/password')
  async postFindPassword(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
    @Body() findPasswordDto: FindPasswordDto,
  ) {
    const user = await this.userService.findOne(findPasswordDto.username);

    if (
      user &&
      user.username === findPasswordDto.username &&
      user.firstname === findPasswordDto.firstname &&
      user.lastname === findPasswordDto.lastname
    ) {
      await this.userService.sendPasswordToEmail(
        findPasswordDto.username,
        findPasswordDto.email,
        findPasswordDto.firstname,
        findPasswordDto.lastname,
      );
    }

    return res.json({ result: true });
  }

  @Get('google/login')
  @UseGuards(AuthGuard('google'))
  async getLogin() {}

  @Get('oauth/google')
  @UseGuards(AuthGuard('google'))
  async getRedirect(
    @Req() req: UserRequestInterface,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    const checkUser = await this.userService.findOne(req.user.email);
    const reloadUrl = req.cookies['login-page'];

    if (!checkUser) {
      await this.userService.addUser({
        affiliation: '',
        email: req.user.email,
        firstname: req.user.firstName,
        lastname: req.user.lastName,
        password: '',
        passwordConfirm: '',
        username: req.user.email,
      });
    }

    return res.redirect(reloadUrl);
  }
}
