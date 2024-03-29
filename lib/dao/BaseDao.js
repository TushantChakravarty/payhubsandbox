'use strict';

//========================== Class Definitions Start =====================

class BaseDao {
  constructor(dbModel) {
    //Get Model
    this.Model = dbModel;
  }

  save(object, options = {}) {
    // Make sure object is an array
    const safeObject = Array.isArray(object) ? object : [object];

    return this.Model.create(safeObject, options);
  }

  findOne(query, projection) {
    return this.Model.findOne(query, projection).exec();
  }

  find(query, projection, sortOptions = { createdAt: -1 }) {
    return this.Model.find(query, projection).sort(sortOptions).exec();
  }

  findOneAndUpdate(query, update, options) {
    return this.Model.findOneAndUpdate(query, update, options).exec();
  }

  findAndModify(query, update, options) {
    return this.Model.findAndModify(query, update, options).exec();
  }

  customFind(query, projection, limit, condition) {
    return this.Model.find(query, projection)
      .limit(limit)
      .sort(condition)
      .exec();
  }

  /**
   * Update Given Model
   * @param query
   * @param toUpdate
   * @return Promise Object
   * @private
   */
  update(query, update, options) {
    if (!options) {
      options = {};
    }
    return this.Model.update(query, update, options).exec();
  }
  updateOne(query, update, options) {
    
    return this.Model.findOneAndUpdate(query, update, options).exec();
  }

  remove(query, options) {
    return this.Model.remove(query, options).exec();
  }

  findByIdAndRemove(query, options) {
    return this.Model.findByIdAndRemove(query, options).exec();
  }

  aggregate(aggPipe) {
    return this.Model.aggregate(aggPipe).exec();
  }

  findByIdAndUpdate(query, update, options) {
    return this.Model.findByIdAndUpdate(query, update, options).exec();
  }

  findById(query) {
    return this.Model.findById(query).exec();
  }

  count(query) {
    return this.Model.count(query).exec();
  }

  findOneAndDelete(query) {
    return this.Model.findOneAndDelete(query);
  }

  findWithPagination(query, skip, limit) {
    return this.Model.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
  }
}

module.exports = BaseDao;

