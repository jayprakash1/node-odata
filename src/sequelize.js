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

const get = (req, sequelizeModel) => {
  return new Promise((resolve, reject) => {
    var includes = [];
    if( (sequelizeModel.getFindOneIncludes != null) && (sequelizeModel.getFindOneIncludes(sequelizeModel.sequelize.models).length > 0) )
      includes = sequelizeModel.getFindOneIncludes(sequelizeModel.sequelize.models);
    sequelizeModel.findById(req.params.id, {include: includes}).then((entity) => {
      
      if (!entity) {
        return reject({status: 404}, {text: 'Not Found'});
      }
      
      return resolve({entity: entity});
      
    }).catch((err) => {
     
        return reject(err);
    });
  });
};

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
    if(err = countParser(resData, sequelizeModel, req.query.$count, req.query.$filter)) {
      return errHandle(err);
    }

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
    if(err = skipParser(query, req.query.$skip)) {
      return errHandle(err);
    }

    /*jshint -W084 */
    if(err = topParser(query, req.query.$top)) {
      return errHandle(err);
    }

    /*jshint -W084 */
    if(err = selectParser(query, req.query.$select)) {
      return errHandle(err);
    }

    // TODO
    // $expand=Customers/Orders
    // $search

    sequelizeModel.findAll(query.build(sequelizeModel, options)).then((data) => {
      resData.value = data;
      return resolve({entity: resData});
    }).catch((err) => {
      return errHandle(err);
    });
  });
};

export default { get, getAll };
