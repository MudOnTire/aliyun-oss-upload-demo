import request from '@/utils/request';

export async function login(params) {
  return request('/api/accounts/login', {
    method: 'POST',
    body: params,
  });
}

export async function logout(params) {
  return request('/api/accounts/logout', {
    method: 'POST'
  });
}

export async function query() {
  return request('/api/users');
}

export async function queryCurrent() {
  return request('/api/accounts/current');
}

export async function updateCurrent(body) {
  return request('/api/accounts/update', {
    method: "PUT",
    body
  });
}

export async function changePassword(body) {
  return request('/api/accounts/current/password', {
    method: "PUT",
    body
  });
}
