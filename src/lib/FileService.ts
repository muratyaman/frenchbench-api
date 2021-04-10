import AWS from 'aws-sdk';
import { Request } from 'express';
import { formidable } from 'formidable';
import path from 'path';
import sharp from 'sharp';
import * as _ from './constants';
import { log } from './utils';
import { IConfig } from './config';

export function newS3Client(config: IConfig): AWS.S3 {
  const { accessKeyId, secretAccessKey } = config.s3;
  return new AWS.S3({ accessKeyId, secretAccessKey });
}

export interface IFileMgrProps {
  config: IConfig;
  s3: AWS.S3;
}

export type FileSizeType = string | 'small' | 'medium' | 'large';

export interface IFileMgr {
  receiveFiles(req: Request): Promise<IReceivedProps>;
  readStreamToBuffer(filePath: string): Promise<Buffer>;
  resizeAndUpload(readBuffer: Buffer, file_name: string, size: FileSizeType): Promise<any>;
  resizeImage(readBuffer: Buffer, widthIn: number): Promise<Buffer>;
  s3UploadFile(Body: Buffer, file_name: string, size: FileSizeType): Promise<any>;
  checkFileType(file: IFileObj): boolean;
  checkFileSize(file: IFileObj): boolean;
  pruneFileName(file: IFileObj): IFileObj;
  getFileExt(filePath: string): string;
}

export interface IFileObj {
  name?: string;
  type?: string;
  size?: number;
}

export interface IReceivedProps {
  fields: any;
  files: any;
}

export class FileService implements IFileMgr {
  
  constructor(private config: IConfig, private s3: AWS.S3) {
    
  }
  
  async receiveFiles(req: Request): Promise<IReceivedProps> {
    const formOptions = { multiples: true, keepExtensions: true, hash: 'sha1' };
    //log('receiveFiles');
    return new Promise((resolve, reject) => {  
      const form = formidable(formOptions);
      //log('receiveFiles form parse start');
      form.parse(req, (err, fields, files) => {
        //log('receiveFiles form parse end', err, fields, files);
        if (err) {
          reject(err);
        } else {
          // const sampleFile = {
          //   size: 13284,
          //   path: '/path-to-temp-folder/upload_2413ccfdac63f873406d89c602112a6a.jpg',
          //   name: 'frenchbench.jpg',
          //   type: 'image/jpeg',
          //   hash: 'a97c303cb92884476c99fa02e5778134c7a352b6',
          //   lastModifiedDate: '2020-10-31T11:16:20.810Z',
          // }
          resolve({ fields, files });
        }
      });
    })
  }

  async readStreamToBuffer(filePath: string): Promise<Buffer> {
    return sharp(filePath).toBuffer();
  }

  async resizeAndUpload(readBuffer: Buffer, file_name: string, size: FileSizeType): Promise<any> {
    let result: any = {};
    try {
      const image = await this.resizeImage(readBuffer, _.MAX_FILE_DIMS[size]);
      result = await this.s3UploadFile(image, file_name, size);
      log('resizeAndUpload', result);
    } catch (err) {
      result.error = err.message;
      log('resizeAndUpload error', err);
    }
    return result;
  }

  async resizeImage(readBuffer: Buffer, widthIn: number): Promise<Buffer> {
    let { width } = await sharp(readBuffer).metadata();
    width = Math.min(width, widthIn);
    return sharp(readBuffer).resize({ width }).toBuffer();
  }

  async s3UploadFile(Body: Buffer, file_name: string, size: FileSizeType): Promise<any> {
    const { Bucket, ACL, folders } = this.config.s3;
    const params = {
      Bucket,
      ACL,
      Key:  [...folders, size, file_name].join('/'), // '/uploads/images/large/uuid.jpg'
      Body, // buffer or readable stream
    };
    return this.s3.upload(params).promise();
  }

  checkFileType({ type }: IFileObj): boolean {
    if (type && _.ACCEPT_MIMETYPES.includes(type)) return true;
    throw new Error(_.ERR_INVALID_FILE_TYPE);
  }

  checkFileSize({ size = 0 }: IFileObj): boolean {
    if (_.MAX_FILE_SIZE < size) throw new Error(_.ERR_INVALID_FILE_SIZE);
    return true;
  }

  pruneFileName(fb_file: IFileObj): IFileObj {
    fb_file.name = String(fb_file.name).toLowerCase().replace(_.FILENAME_NOT_ACCEPTABLE_CHAR, '-');
    return fb_file;
  }

  getFileExt(filePath: string): string {
    return path.extname(filePath).toLocaleLowerCase(); // => '.jpg'
  }
}
