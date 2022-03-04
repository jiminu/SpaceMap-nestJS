import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import uuidRandom from './uuid-random';

export const ResourceFileMulterOptions = {
  fileFilter: (request, file, callback) => {
    const pattern =
      /\/(jpg|jpeg|png|gif|pdf|docx|xlsx|pptx|vnd.openxmlformats-officedocument.spreadsheetml.sheet|vnd.openxmlformats-officedocument.presentationml.presentation|vnd.openxmlformats-officedocument.wordprocessingml.document)$/;
    if (file.mimetype.match(pattern)) {
      callback(null, true);
    } else {
      // callback(null, false);
      callback(null, true);
    }
  },

  storage: diskStorage({
    destination: (request, file, callback) => {
      const uploadPath: string = 'uploads';

      if (!existsSync(uploadPath)) {
        // public 폴더가 존재하지 않을시, 생성합니다.
        mkdirSync(uploadPath);
      }

      callback(null, uploadPath);
    },

    filename: (request, file, callback) => {
      callback(null, uuidRandom(file));
    },
  }),
};
