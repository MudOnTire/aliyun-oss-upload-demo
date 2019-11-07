import { stringify } from 'qs';
import request from '@/utils/request';

export default class ServiceBase {
  constructor(resource) {
    this.urlBase = `/api/${resource}`;
  }

  queryItems = async (params) => {
    return request(`${this.urlBase}?${stringify(params)}`);
  }

  saveItem = async (params) => {
    if (params._id) {
      return request(`${this.urlBase}/${params._id}`, {
        method: "PUT",
        body: params
      });
    }
    return request(this.urlBase, {
      method: "POST",
      body: params
    });
  }

  getItemDetail = async (params) => {
    return request(`${this.urlBase}/${params._id}`);
  }

  deleteItem = async (params) => {
    return request(`${this.urlBase}/${params._id}`, {
      method: "DELETE"
    });
  }
}