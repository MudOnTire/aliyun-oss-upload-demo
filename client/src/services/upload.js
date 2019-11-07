import request from '@/utils/request';
import { stringify } from 'qs';
import ServiceBase from './ServiceBase';

class UploadService extends ServiceBase {
  constructor(...props) {
    super(...props);
  }

  getCredential = () => {
    return request(`${this.urlBase}/credential`);
  } 
}

const uploadService = new UploadService('upload');

export { uploadService };