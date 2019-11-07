const mongoose = require('mongoose');
const Schema = mongoose.Schema;

class BaseController {
  constructor(DBModel, queryKey) {
    this.DBModel = DBModel;
    this.queryKey = queryKey;
    this.hasWatchCount = !!DBModel.schema.path('watchCount');
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.query = this.query.bind(this);
    this.deleteMany = this.deleteMany.bind(this);
    this.findById = this.findById.bind(this);
    this.remove = this.remove.bind(this);
    this.unDeleted = [{ isDeleted: false }, { isDeleted: undefined }];
  }

  create(req, res, next, extraParams = {}) {
    const { DBModel } = this;
    const content = {
      ...req.body,
      createdTime: new Date(),
      updatedTime: new Date(),
      fromUser: req.user && req.user._id,
      ...extraParams
    };
    if (this.hasWatchCount) {
      content.watchCount = 0;
    }
    DBModel.create(content)
      .then(newItem => {
        req.result = newItem;
        next();
      })
      .catch(next);
  }

  update(req, res, next) {
    const { DBModel } = this;
    const targetId = req.params.id;
    const content = {
      ...req.body,
      updatedTime: new Date()
    };
    DBModel.findOneAndUpdate({ _id: targetId }, content)
      .then(result => {
        next();
      })
      .catch(next);
  }

  query(req, res, next, extraParams = {}, fieldsToPopulate = []) {
    const { DBModel, queryKey } = this;
    const params = {
      ...req.query,
      ...extraParams
    };
    // query
    if (params.query) {
      params[queryKey] = new RegExp(params.query, 'i');
      delete params.query;
    }
    // pagination
    delete params.pageNum;
    delete params.pageSize;
    const pageNum = Number(req.query.pageNum) || 1;
    const pageSize = Number(req.query.pageSize) || 10;

    // sort
    delete params.sortBy;
    delete params.sortDir;
    const sortBy = req.query.sortBy || 'updatedTime';
    const sortDir = req.query.sortDir || 'desc';
    const sort = {};
    sort[sortBy] = sortDir;

    console.log(params);
    let queryResult = DBModel.find(params)
      .or(this.unDeleted)
      .sort(sort)
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .populate('fromUser');

    if (fieldsToPopulate && fieldsToPopulate.length > 0) {
      for (let i = 0; i < fieldsToPopulate.length; i++) {
        const field = fieldsToPopulate[i];
        queryResult = queryResult.populate(field);
      }
    }

    queryResult.then((items) => {
      DBModel.$where('!this.isDeleted').count(params, (err, count) => {
        if (err) {
          next(err);
        } else {
          req.result = {
            list: items,
            pagination: {
              pageNum,
              pageSize,
              total: count
            },
            query: params
          };
          next();
        }
      });
    }).catch(next);
  }

  findById(req, res, next, fieldsToPopulate = []) {
    const { DBModel } = this;
    const targetId = req.params.id;
    let queryResult = DBModel.findById(targetId).populate('fromUser');
    if (fieldsToPopulate && fieldsToPopulate.length > 0) {
      for (let i = 0; i < fieldsToPopulate.length; i++) {
        const field = fieldsToPopulate[i];
        queryResult = queryResult.populate(field);
      }
    }
    queryResult.then(result => {
      req.result = result;
      if (result && this.hasWatchCount) {
        DBModel.findByIdAndUpdate(targetId, { watchCount: (result.watchCount || 0) + 1 }).then(r => { }).catch(e => { })
      }
      next();
    })
      .catch(next);
  }

  deleteMany(req, res, next) {
    const { DBModel } = this;
    const params = {
      ...req.query
    };
    if (Object.keys(params).length <= 0) {
      next();
    }
    DBModel.updateMany(params, { isDeleted: true })
      .then(result => {
        req.result = result;
        next();
      })
      .catch(next);
  }

  remove(req, res, next) {
    const { DBModel } = this;
    const targetId = req.params.id;
    DBModel.findOneAndUpdate({ _id: targetId }, { isDeleted: true })
      .then(result => {
        req.result = result;
        next();
      })
      .catch(next);
  }

}

module.exports = BaseController;
