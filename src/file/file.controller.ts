import {
  Controller,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResourceFileMulterOptions } from './multers/resource-file-multer-options';

@Controller('file')
export class FileController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', ResourceFileMulterOptions))
  fileUpload(
    @Req() req: Request,
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return res.json({
      origin_name: file.originalname,
      filename: file.filename,
      size: file.size,
      type: file.mimetype,
    });
  }
}
