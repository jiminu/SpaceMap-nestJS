import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Render,
  Req,
  Res,
  Session,
} from '@nestjs/common';
import { ResourceService } from './resource.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { UserRequestInterface } from '../interfaces/user.request.interface';
import { Request, Response } from 'express';
import getStartAndEnd from '../helpers/paging';
import getDownloadFilename from '../helpers/download-filename';
import { ResourceFileService } from '../resource-file/resource-file.service';
import { SearchDto } from '../helpers/dto/search.dto';
import { cozyLog } from '../helpers/debug';

@Controller('resource')
export class ResourceController {
  constructor (
    private readonly resourceService: ResourceService,
    private readonly resourceFileService: ResourceFileService,
  ) {}

  @Post()
  create (@Body() createResourceDto: CreateResourceDto) {
    return this.resourceService.create(createResourceDto);
  }

  @Get(':boardType')
  async resourceList (
    @Req() req: UserRequestInterface,
    @Res() res: Response,
    @Session() session: Record<string, any>,
    @Param('boardType') boardType: string,
    @Body() searchDto: SearchDto,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    searchDto.boardType = boardType;
    let paging = {
      limit: limit,
      route: '/resource/' + boardType,
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

    return res.render('resource/list', {
      title: boardType,
      locals: res.locals,
      header: true,
      footer: true,
      paging,
      data,
    });
  }

  @Get('view/:id')
  @Render('resource/view')
  async findOne (
    @Req() req: UserRequestInterface,
    @Res() res: Response,
    @Session() session: Record<string, any>,
    @Param('id') id: number,
  ) {
    const data = await this.resourceService.findOne(id);
    const prev = await this.resourceService.findPrev(id, data.board_type);
    const next = await this.resourceService.findNext(id, data.board_type);

    cozyLog(id);
    cozyLog(data);

    return {
      title: 'resources',
      locals: res.locals,
      header: true,
      footer: true,
      data,
      prev,
      next,
    };
  }

  @Patch(':id')
  update (
    @Param('id') id: string,
    @Body() updateResourceDto: UpdateResourceDto,
  ) {
    return this.resourceService.update(+id, updateResourceDto);
  }

  @Delete(':id')
  remove (@Param('id') id: string) {
    return this.resourceService.remove(+id);
  }

  @Get('uploads/:filename')
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
