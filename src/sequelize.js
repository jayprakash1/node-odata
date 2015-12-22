"use strict";

import Builder from 'sequelize-query-builder';
import countParser from './parser/countParser';
import filterParser from './parser/filterParser';
import orderbyParser from './parser/orderbyParser';
import skipParser from './parser/skipParser';
import topParser from './parser/topParser';
import selectParser from './parser/selectParser';
import searchParser from './parser/searchParser';
import expandParser from './parser/expandParser';
import Promise from 'bluebird';
import _ from 'lodash';

const get = (req, sequelizeModel, options) => {
  return new Promise((resolve, reject) => {
    var includes = [];
    if( (sequelizeModel.getFindOneIncludes != null) && (sequelizeModel.getFindOneIncludes(sequelizeModel.sequelize.models, options).length > 0) )
      includes = sequelizeModel.getFindOneIncludes(sequelizeModel.sequelize.models, options);
    
    var includeAttributes = [];
    if( (sequelizeModel.getAttributesInclude != null) && (sequelizeModel.getAttributesInclude(options).length > 0) )
      includeAttributes = sequelizeModel.getAttributesInclude(options);

    sequelizeModel.findById(req.params.id, {attributes: {include: includeAttributes}, include: includes}).then((entity) => {
      
      if (!entity) {
        return reject({status: 404}, {text: 'Not Found'});
      }
      
      return resolve({entity: entity});
      
    }).catch((err) => {
     
        return reject(err);
    });
  });
};

// TODO: find a better name. This part is common between main model and getMoreResultsModel so keeping the logic at once place
const queryParsing = (query, req, skip, numOfRows, errHandle, err) => {
  if(err = searchParser(query, req.query.$search)){
    return errHandle(err);
  }

  if(err = expandParser(query, req.query.$expand)){
    return errHandle(err);
  }

  /*jshint -W084 */
  if(err = filterParser(query, req.query.$filter)) {
    return errHandle(err);
  }

  /*jshint -W084 */
  if(err = orderbyParser(query, req.query.$orderby)) {
    return errHandle(err);
  }

  /*jshint -W084 */
  if(err = skipParser(query, skip)) {
    return errHandle(err);
  }

  /*jshint -W084 */
  if(err = topParser(query, numOfRows)) {
    return errHandle(err);
  }

  /*jshint -W084 */
  if(err = selectParser(query, req.query.$select)) {
    return errHandle(err);
  }
}

const getAll = (req, sequelizeModel, options) => {
  return new Promise((resolve, reject) => {
    let resData = {};

    let query = new Builder();

    let errHandle = (err) => {
      err.status = 500;
      return reject(err);
    };
    let err;

    /*jshint -W084 */
    // TODO: should be moved to queryParsing method
    if(err = countParser(resData, sequelizeModel, req.query.$count, req.query.$filter)) {
      return errHandle(err);
    }

    queryParsing(query, req, req.query.$skip, req.query.$top, errHandle, err);

    // TODO
    // $expand=Customers/Orders
    // $search

    let findAllArgs;
    return sequelizeModel.findAndCountAll((findAllArgs = query.build(sequelizeModel, options))).then((data) => {
      console.log("total number of rows: " +data.count);
      // Check the limit on results and data length received so that we can augment results with moreResults table
      if(findAllArgs.limit && data.rows.length < findAllArgs.limit && _.isFunction(sequelizeModel.getMoreResultsModel)){
        let moreResultsModel = sequelizeModel.getMoreResultsModel(sequelizeModel.sequelize.models);
        let moreResultsquery = new Builder();
        let moreRowsRequired = findAllArgs.limit - data.rows.length;
        let skipCount = data.rows.length ? null : findAllArgs.offset ? (findAllArgs.offset - data.count) : null;
        queryParsing(moreResultsquery, req, skipCount, moreRowsRequired, errHandle, err);
        // TODO; review logic for limit & top here. Ignoring all of that for now and return all results from moreResultsModel 
        return moreResultsModel.findAll(moreResultsquery.build(moreResultsModel, options)).then((moreData) => {
          resData.value = data.rows.concat(moreData);
          return resolve({entity: resData});
        });
      } else {
        resData.value = data.rows;
        return resolve({entity: resData});
      }
    }).catch((err) => {
      return errHandle(err);
    });
  });
};

export default { get, getAll };
