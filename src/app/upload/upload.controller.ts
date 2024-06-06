import {
  Controller,
  Delete,
  HttpException,
  HttpStatus,
  Param,
  Post,
  //   Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
// import { Response } from 'express';
import { diskStorage } from 'multer';
// import { ResponseSuccess } from 'src/utils/response';
import BaseResponse from 'src/utils/response/base.response';
import * as fs from 'fs';
import * as path from 'path';
@Controller('upload')
export class UploadController extends BaseResponse {
  @Post('file')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 3145728,
      },
      fileFilter: (req, file, cb) => {
        console.log(file);
        if (file.originalname.match(/^.*\.(jpg|webp|png|jpeg|gif)$/))
          cb(null, true);
        else {
          cb(
            new HttpException(
              'unaccepted file extension or size',
              HttpStatus.UNPROCESSABLE_ENTITY,
            ),
            false,
          );
        }
      },
      storage: diskStorage({
        destination: './public/uploads',
        filename: (req, file, cb) => {
          console.log('file => ', file);
          cb(
            null,
            // `${new Date().getTime()}.${file.originalname.split('.')[1]}`,
            `${new Date().getTime()}.${file.originalname.split('.').pop()}`,
          );
        },
      }),
    }),
  )
  async uploadFile(
    @UploadedFile()
    file: Express.Multer.File,
    // @Res() res: Response,
  ): Promise<any> {
    try {
      console.log(file);
      //   if (!file)
      //     return res.status(400).json({
      //       message: 'please enter an image',
      //     });
      const url = `http://localhost:${process.env.PORT}/uploads/${file.filename}`;
      return this._success('OK', {
        file_url: url,
        file_name: file.filename,
        file_size: file.size,
      });
    } catch (err) {
      console.log(err);
      throw new HttpException('Ada Kesalahan', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('files')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: {
        fileSize: 3145728,
      },
      fileFilter: (req, file, cb) => {
        console.log(file);
        if (file.originalname.match(/^.*\.(jpg|webp|png|jpeg|gif)$/))
          cb(null, true);
        else {
          cb(
            new HttpException(
              'unaccepted file extension or size',
              HttpStatus.UNPROCESSABLE_ENTITY,
            ),
            false,
          );
        }
      },
      storage: diskStorage({
        destination: 'public/uploads',
        filename: (req, file, cb) => {
          const fileExtension = file.originalname.split('.').pop();
          cb(null, `${new Date().getTime()}.${fileExtension}`);
        },
      }),
    }),
  )
  async uploadFileMulti(
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<any> {
    try {
      const file_response: Array<{
        file_url: string;
        file_name: string;
        file_size: number;
      }> = [];

      files.forEach((file) => {
        const url = `http://localhost:${process.env.PORT}/uploads/${file.filename}`;
        file_response.push({
          file_url: url,
          file_name: file.filename,
          file_size: file.size,
        });
      });

      return this._success('OK', {
        file: file_response,
      });
    } catch (err) {
      throw new HttpException('Ada Kesalahan', HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('/delete/:filename')
  async deleteFile(@Param('filename') filename: string) {
    try {
      const filePath = `/public/uploads/${filename}`;
      // console.log(filePath);
      const pathName = path.join(__dirname, '../../..', filePath);
      // console.log(pathName);
      fs.unlinkSync(pathName);
      return this._success('Berhasil menghapus File');
    } catch (err) {
      throw new HttpException('File not Found', HttpStatus.NOT_FOUND);
    }
  }
}
