import { routerRedux } from 'dva/router';
import { stringify } from 'qs';
import { query as queryUsers, queryCurrent, updateCurrent, changePassword } from '@/services/user';

export default {
  namespace: 'user',

  state: {
    list: [],
    currentUser: {},
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *fetchCurrent(_, { call, put }) {
      const response = yield call(queryCurrent);
      if (response && response.code === 0) {
        yield put({
          type: 'saveCurrentUser',
          payload: response.result,
        });
      } else {
        yield put(
          routerRedux.push({
            pathname: '/user/login',
            search: stringify({
              redirect: window.location.href,
            }),
          })
        );
      }
    },
    *updateCurrent({ callback, payload }, { call, put }) {
      const response = yield call(updateCurrent, payload);
      if (callback) callback(response);
    },
    *changePassword({ callback, payload }, { call, put }) {
      const response = yield call(changePassword, payload);
      if (callback) callback(response);
    }
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload || {},
      };
    },
    changeNotifyCount(state, action) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload,
        },
      };
    },
  },
};
