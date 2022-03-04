import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Render,
  Req,
  Res,
  Session,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ContactService } from '../contact/contact.service';
import { ResourceService } from '../resource/resource.service';
import { AdminService } from './admin.service';
import { CreateContactDto } from '../contact/dto/create-contact.dto';
import { UpdateContactDto } from '../contact/dto/update-contact.dto';
import { UpdateResourceDto } from '../resource/dto/update-resource.dto';
import { CreateResourceDto } from '../resource/dto/create-resource.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResourceFileMulterOptions } from '../file/multers/resource-file-multer-options';
import { UserService } from '../user/user.service';
import { ResourceFileService } from '../resource-file/resource-file.service';
import { CreateResourceFileDto } from '../resource-file/dto/create-resource-file.dto';
import { UserRequestInterface } from '../interfaces/user.request.interface';
import getDownloadFilename from '../helpers/download-filename';
import getStartAndEnd from '../helpers/paging';
import { SearchDto } from '../helpers/dto/search.dto';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthenticatedAdminFilter } from 'src/auth/authenticated-admin.filter';
import { LocalAdminAuthGuard } from 'src/auth/local-admin-auth.guard';
import { AuthenticatedAdminGuard } from 'src/auth/authenticated-admin.guard';
import { ChangePasswordDto } from '../user/dto/change-password.dto';

import * as bcrypt from 'bcrypt';
import { cozyLog } from '../helpers/debug';

@Controller('admin')
export class AdminController {
  constructor (
    private readonly userService: UserService,
    private readonly adminService: AdminService,
    private readonly contactService: ContactService,
    private readonly resourceService: ResourceService,
    private readonly resourceFileService: ResourceFileService,
  ) {}

  @Get('login')
  @Render('admin/login')
  getLogin (
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    return {
      locals: res.locals,
      layout: 'layouts/empty.hbs',
      title: 'Login',
    };
  }

  @Post('login')
  @UseGuards(LocalAdminAuthGuard)
  async postLogin (
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    req.login(req.user, function (err) {
      if (err) {
        // If req.user is null, it gets error too.
        session.errors = ['로그인 정보가 존재하지 않습니다.'];
        return res.redirect('/admin/login');
      }
      return res.redirect('/admin');
    });
  }

  @Get('logout')
  @UseGuards(AuthenticatedAdminGuard)
  @UseFilters(AuthenticatedAdminFilter)
  getLogout (
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    req.logout();

    return res.redirect('/admin/login');
  }

  @Get()
  @UseGuards(AuthenticatedAdminGuard)
  @UseFilters(AuthenticatedAdminFilter)
  @Render('admin/index')
  getIndex (
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    return {
      layout: 'layouts/admin.hbs',
      title: 'Index',
    };
  }

  @Get('change-password')
  @UseGuards(AuthenticatedAdminGuard)
  @UseFilters(AuthenticatedAdminFilter)
  @Render('admin/changePassword')
  getChangePassword (
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    return {
      layout: 'layouts/admin.hbs',
      title: 'Change password',
    };
  }

  @Post('change-password')
  @UseGuards(AuthenticatedAdminGuard)
  @UseFilters(AuthenticatedAdminFilter)
  async postChangePassword (
    @Req() req: UserRequestInterface,
    @Res() res: Response,
    @Session() session: Record<string, any>,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const user = await this.userService.findOneById(req.user.id);
    const errors = [];

    if (!await bcrypt.compare(changePasswordDto.oldPassword, user.password)) {
      session.errors = errors;
      return res.redirect('/admin/change-password');
    }

    if (changePasswordDto.newPassword !== changePasswordDto.newPasswordConfirm) {
      errors.push('New password and new password confirm are different.');
      session.errors = errors;
      return res.redirect('/admin/change-password');
    }

    return res.render('admin/changePassword', {
      layout: 'layouts/admin.hbs',
      title: 'Change password',
      locals: res.locals,
    });
  }

  //region Contact Us
  @Get('contact-us')
  @UseGuards(AuthenticatedAdminGuard)
  @UseFilters(AuthenticatedAdminFilter)
  @Render('admin/contact/list')
  async getContactUs (
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
    @Body() searchDto: SearchDto,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    searchDto.orderByField = 'id';
    searchDto.orderByDirection = 'DESC';
    let paging = {
      limit: 10,
      route: '/admin/contact-us',
      display: 5,
    };
    const data = await this.contactService.paginate(
      { page, limit: paging.limit, route: paging.route },
      searchDto,
    );
    paging = Object.assign(
      {},
      paging,
      getStartAndEnd(page, data.meta.totalPages, paging.display),
    );

    return {
      layout: 'layouts/admin.hbs',
      title: 'Contact Us',
      menu: 'contact-us',
      locals: res.locals,
      paging,
      data,
    };
  }

  @Get('contact-us/create')
  @UseGuards(AuthenticatedAdminGuard)
  @UseFilters(AuthenticatedAdminFilter)
  @Render('admin/contact/form')
  getContactUsCreateForm (
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    return {
      layout: 'layouts/admin.hbs',
      title: 'Contact Us',
      menu: 'contact-us',
      action: '/admin/contact-us/create',
    };
  }

  @Post('contact-us/create')
  @UseGuards(AuthenticatedAdminGuard)
  @UseFilters(AuthenticatedAdminFilter)
  async createContactUs (
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
    @Body() createContactDto: CreateContactDto,
  ) {
    await this.contactService.create(createContactDto);
    return res.redirect('/admin/contact-us');
  }

  @Post('contact-us/update/:id')
  @UseGuards(AuthenticatedAdminGuard)
  @UseFilters(AuthenticatedAdminFilter)
  async updateContactUs (
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
    @Param('id') id: number,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    await this.contactService.update(id, updateContactDto);
    return res.redirect('/admin/contact-us');
  }

  @Post('contact-us/delete/:id')
  @UseGuards(AuthenticatedAdminGuard)
  @UseFilters(AuthenticatedAdminFilter)
  async deleteContactUs (
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
    @Param('id') id: number,
  ) {
    await this.contactService.remove(id);
    return res.redirect('/admin/contact-us');
  }

  @Get('contact-us/:id')
  @UseGuards(AuthenticatedAdminGuard)
  @UseFilters(AuthenticatedAdminFilter)
  @Render('admin/contact/form')
  async getContactUsDetail (
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
    @Param('id') id: number,
  ) {
    const data = await this.contactService.findOne(id);

    return {
      layout: 'layouts/admin.hbs',
      title: 'Contact Us',
      menu: 'contact-us',
      action: '/admin/contact-us/update/' + id,
      deleteAction: '/admin/contact-us/delete/' + id,
      data,
    };
  }

  //endregion Contact Us

  //region Resource
  @Get('resource')
  @UseGuards(AuthenticatedAdminGuard)
  @UseFilters(AuthenticatedAdminFilter)
  @Render('admin/resource/list')
  async getResource (
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
    @Body() searchDto: SearchDto,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    searchDto.orderByField = 'resource.id';
    searchDto.orderByDirection = 'DESC';
    let paging = {
      limit: limit,
      route: '/admin/resource',
      display: 5,
    };
    const data = await this.resourceService.paginate(
      { page, limit: paging.limit, route: paging.route },
      searchDto,
    );
    paging = Object.assign(
      {},
      paging,
      getStartAndEnd(page, data.meta.totalPages, paging.display),
    );

    return {
      layout: 'layouts/admin.hbs',
      title: 'Resource',
      menu: 'resource',
      locals: res.locals,
      paging,
      data,
    };
  }

  @Get('resource/create')
  @UseGuards(AuthenticatedAdminGuard)
  @UseFilters(AuthenticatedAdminFilter)
  @Render('admin/resource/form')
  getResourceCreateForm (
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    return {
      layout: 'layouts/admin.hbs',
      title: 'Resource',
      menu: 'resource',
      action: '/admin/resource/create',
    };
  }

  @Post('resource/create')
  @UseGuards(AuthenticatedAdminGuard)
  @UseFilters(AuthenticatedAdminFilter)
  async createResource (
    @Req() req: UserRequestInterface,
    @Res() res: Response,
    @Session() session: Record<string, any>,
    @Body() createResourceDto: CreateResourceDto,
  ) {
    createResourceDto.user = await this.userService.findOne(req.user.username);
    const resource = await this.resourceService.create(createResourceDto);

    if (typeof createResourceDto.files === 'string')
      createResourceDto.files = [createResourceDto.files];

    createResourceDto.files?.map(async (item) => {
      const file = JSON.parse(item);
      const fileDto = new CreateResourceFileDto();
      fileDto.origin_name = file.origin_name;
      fileDto.filename = file.filename;
      fileDto.size = file.size;
      fileDto.type = file.type;
      fileDto.resource = resource;
      await this.resourceFileService.create(fileDto);

      return file;
    });

    return res.redirect('/admin/resource');
  }

  @Post('resource/update/:id')
  @UseGuards(AuthenticatedAdminGuard)
  @UseFilters(AuthenticatedAdminFilter)
  async updateResource (
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
    @Param('id') id: number,
    @Body() updateResourceDto: UpdateResourceDto,
  ) {
    const resource = await this.resourceService.update(id, updateResourceDto);
    await this.resourceFileService.removeFilesByResource(resource);
    updateResourceDto.files?.map(async (item) => {
      const file = JSON.parse(item);
      const fileDto = new CreateResourceFileDto();
      fileDto.origin_name = file.origin_name;
      fileDto.filename = file.filename;
      fileDto.size = file.size;
      fileDto.type = file.type;
      fileDto.resource = resource;
      await this.resourceFileService.create(fileDto);

      return file;
    });

    return res.redirect('/admin/resource');
  }

  @Post('resource/delete/:id')
  @UseGuards(AuthenticatedAdminGuard)
  @UseFilters(AuthenticatedAdminFilter)
  async deleteResource (
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
    @Param('id') id: number,
  ) {
    await this.resourceService.remove(id);
    return res.redirect('/admin/resource');
  }

  @Get('resource/:id')
  @UseGuards(AuthenticatedAdminGuard)
  @UseFilters(AuthenticatedAdminFilter)
  @Render('admin/resource/form')
  async getResourceDetail (
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
    @Param('id') id: number,
  ) {
    const data = await this.resourceService.findOne(id);

    return {
      layout: 'layouts/admin.hbs',
      title: 'Resource',
      menu: 'resource',
      action: '/admin/resource/update/' + id,
      deleteAction: '/admin/resource/delete/' + id,
      data,
    };
  }

  //endregion Resource

  //region User
  @Get('user')
  @UseGuards(AuthenticatedAdminGuard)
  @UseFilters(AuthenticatedAdminFilter)
  @Render('admin/user/list')
  async getUser (
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
    @Body() searchDto: SearchDto,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    searchDto.orderByField = 'id';
    searchDto.orderByDirection = 'DESC';
    let paging = {
      limit: 10,
      route: '/admin/user',
      display: 5,
    };
    const data = await this.userService.paginate(
      { page, limit: paging.limit, route: paging.route },
      searchDto,
    );
    paging = Object.assign(
      {},
      paging,
      getStartAndEnd(page, data.meta.totalPages, paging.display),
    );

    return {
      layout: 'layouts/admin.hbs',
      title: 'User',
      menu: 'user',
      locals: res.locals,
      paging,
      data,
    };
  }

  @Get('user/create')
  @UseGuards(AuthenticatedAdminGuard)
  @UseFilters(AuthenticatedAdminFilter)
  @Render('admin/user/form')
  getUserCreateForm (
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    return {
      layout: 'layouts/admin.hbs',
      title: 'User',
      menu: 'user',
      action: '/admin/user/create',
    };
  }

  @Post('user/create')
  @UseGuards(AuthenticatedAdminGuard)
  @UseFilters(AuthenticatedAdminFilter)
  async createUser (
    @Req() req: UserRequestInterface,
    @Res() res: Response,
    @Session() session: Record<string, any>,
    @Body() createUserDto: CreateUserDto,
  ) {
    const user = await this.userService.addUser(createUserDto);

    return res.redirect('/admin/user');
  }

  @Post('user/update/:id')
  async updateUser (
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.userService.updateUser(updateUserDto);

    return res.redirect('/admin/user');
  }

  @Post('user/delete/:id')
  @UseGuards(AuthenticatedAdminGuard)
  @UseFilters(AuthenticatedAdminFilter)
  async deleteUser (
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
    @Param('id') id: number,
  ) {
    await this.userService.remove(id);
    return res.redirect('/admin/user');
  }

  @Get('user/:id')
  @UseGuards(AuthenticatedAdminGuard)
  @UseFilters(AuthenticatedAdminFilter)
  @Render('admin/user/form')
  async getUserDetail (
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
    @Param('id') id: number,
  ) {
    const data = await this.userService.findOneById(id);

    return {
      layout: 'layouts/admin.hbs',
      title: 'User',
      menu: 'user',
      action: '/admin/user/update/' + id,
      deleteAction: '/admin/user/delete/' + id,
      data,
    };
  }

  //endregion User

  @Post('upload')
  @UseGuards(AuthenticatedAdminGuard)
  @UseFilters(AuthenticatedAdminFilter)
  @UseInterceptors(FileInterceptor('file', ResourceFileMulterOptions))
  fileUpload (
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return res.json({
      origin_name: file.originalname,
      filename: file.filename,
      size: file.size,
      type: file.mimetype,
    });
  }

  @Get('uploads/:filename')
  @UseGuards(AuthenticatedAdminGuard)
  @UseFilters(AuthenticatedAdminFilter)
  async seeUploadedFile (
    @Req() req: Request,
    @Res() res: Response,
    @Param('filename') filename,
  ) {
    const file = await this.resourceFileService.findOneByFilename(filename);
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + getDownloadFilename(req, file.origin_name),
    );
    res.setHeader('Content-Transfer-Encoding', 'binary');
    res.setHeader('Content-Type', 'application/octet-stream');
    return res.sendFile(file.filename, { root: 'uploads' });
  }
}
