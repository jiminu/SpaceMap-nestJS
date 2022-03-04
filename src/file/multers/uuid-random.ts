import { extname } from 'path';
import { v4 as uuid } from 'uuid';

export default (file): string => {
  return `${uuid()}${extname(file.originalname)}`;
};
