import AWS from 'aws-sdk';
import formidable from 'formidable';
import path from 'path';
import sharp from 'sharp';
import * as _ from './constants';
import { log } from './utils';

export function newS3Client({ config }) {
  const { accessKeyId, secretAccessKey } = config.s3;
  return new AWS.S3({ accessKeyId, secretAccessKey });
}

export function newFileMgr({ config, s3 }) {
  const { Bucket, ACL, folders } = config.s3;
  const formOptions = { multiples: true, keepExtensions: true, hash: 'sha1' };

  async function receiveFiles(req) {
    log('receiveFiles');
    return new Promise((resolve, reject) => {  
      const form = formidable(formOptions);
      log('receiveFiles form parse start');
      form.parse(req, (err, fields, files) => {
        log('receiveFiles form parse end', err, fields, files);
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

  async function readStreamToBuffer(filePath) {
    return sharp(filePath).toBuffer();
  }

  async function resizeAndUpload(readBuffer, file_name, size) {
    let result = {};
    try {
      const image = await resizeImage(readBuffer, _.MAX_FILE_DIMS[size]);
      result = await s3UploadFile(image, file_name, size);
      log('resizeAndUpload', result);
    } catch (err) {
      result.error = err.message;
      log('resizeAndUpload error', err);
    }
    return result;
  }

  async function resizeImage(readBuffer, widthIn) {
    let { width } = await sharp(readBuffer).metadata();
    width = Math.min(width, widthIn);
    return sharp(readBuffer).resize({ width }).toBuffer();
  }

  async function s3UploadFile(Body, file_name, size) {
    const params = {
      Bucket,
      ACL,
      Key:  [...folders, size, file_name].join('/'), // '/uploads/images/large/uuid.jpg'
      Body, // buffer or readable stream
    };
    return s3.upload(params).promise();
  }

  function checkFileType({ type }) {
    if (!_.ACCEPT_MIMETYPES.includes(type)) throw new Error(_.ERR_INVALID_FILE_TYPE);
    return true;
  }

  function checkFileSize({ size = 0 }) {
    if (_.MAX_FILE_SIZE < size) throw new Error(_.ERR_INVALID_FILE_SIZE);
    return true;
  }

  function pruneFileName(fb_file) {
    fb_file.name = String(fb_file.name).toLowerCase().replace(_.FILENAME_NOT_ACCEPTABLE_CHAR, '-');
    return fb_file;
  }

  function getFileExt(filePath) {
    return path.extname(filePath).toLocaleLowerCase(); // => '.jpg'
  }

  return {
    receiveFiles,
    readStreamToBuffer,
    resizeAndUpload,
    resizeImage,
    s3UploadFile,
    checkFileType,
    checkFileSize,
    pruneFileName,
    getFileExt,
  };
}
