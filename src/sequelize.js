"use strict";

import Builder from 'sequelize-query-builder'
import countParser from './parser/countParser';
import filterParser from './parser/filterParser';
import orderbyParser from './parser/orderbyParser';
import skipParser from './parser/skipParser';
import topParser from './parser/topParser';
import selectParser from './parser/selectParser';

const get = (req, sequelizeModel) => {
  return new Promise((resolve, reject) => {
    sequelizeModel.findById(req.params.id).then((entity) => {
      
      if (!entity) {
        return reject({status: 404}, {text: 'Not Found'});
      }
      
      return resolve({entity: entity});
      
    }).catch((err) => {
     
        return reject(err);
    });
  });
};

const getAll = (req, sequelizeModel) => {
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

    sequelizeModel.find(builder.build()).then((data) => {
      resData.value = data;
      return resolve({entity: resData});
    }).catch((err) => {
      return errHandle(err);
    });
  });
};

export default { get, getAll };
