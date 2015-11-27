"use strict";

// Operator  Description             Example
// Comparison Operators
// eq        Equal                   Address/City eq 'Redmond'
// ne        Not equal               Address/City ne 'London'
// gt        Greater than            Price gt 20
// ge        Greater than or equal   Price ge 10
// lt        Less than               Price lt 20
// le        Less than or equal      Price le 100
// has       Has flags               Style has Sales.Color'Yellow'    #todo
// Logical Operators
// and       Logical and             Price le 200 and Price gt 3.5
// or        Logical or              Price le 3.5 or Price gt 200     #todo
// not       Logical negation        not endswith(Description,'milk') #todo

// eg.
//   http://host/service/Products?$filter=Price lt 10.00
//   http://host/service/Categories?$filter=Products/$count lt 10

import functions from './functionsParser';
import parser from 'odata-parser';

export default (query, $filter) => {
  if (!$filter) {
    return;
  }
 
  // trying to use odata-parser here which is the ideal solution for the entire odata things but trying to hack it here first 
  let ast = parser.parse("$filter="+$filter);
  if(ast.error){
    throw("parsing error: " + ast.error);
  }
  ast = ast.$filter; // we only passed filter here for now

  let whereCondObj  = {};
  let getWhereCondObj = function(ast){
    let tempWhereCondObj = {};
    switch(ast.type){
      case 'and': 
        return {$and: [getWhereCondObj(ast.left), getWhereCondObj(ast.right)]};
      case 'or':
        return {$or: [getWhereCondObj(ast.left), getWhereCondObj(ast.right)]};
      case 'eq':
        tempWhereCondObj[getWhereCondObj(ast.left)] = {$eq: getWhereCondObj(ast.right)}; 
        return tempWhereCondObj;
      case 'gt':
        tempWhereCondObj[getWhereCondObj(ast.left)] = {$gt: getWhereCondObj(ast.right)};
        return tempWhereCondObj; 
      case 'ge':
        tempWhereCondObj[getWhereCondObj(ast.left)] = {$gte: getWhereCondObj(ast.right)};
        return tempWhereCondObj; 
      case 'lt':
        tempWhereCondObj[getWhereCondObj(ast.left)] = {$lt: getWhereCondObj(ast.right)};
        return tempWhereCondObj; 
      case 'le':
        tempWhereCondObj[getWhereCondObj(ast.left)] = {$lte: getWhereCondObj(ast.right)}; 
        return tempWhereCondObj; 
      case 'ne':
        tempWhereCondObj[getWhereCondObj(ast.left)] = {$ne: getWhereCondObj(ast.right)}; 
        return tempWhereCondObj;
      case 'property':
        return ast.name;
      case 'literal':
        //TODO: FIXLATER: special handling for null value for now. the ast grammar in odata-parser also seems to be incorrect. please raise issue for that so that can get fixed. 
        if(ast.value === ['null', '']){
          return null;
        }
        return ast.value;
      default:
        throw('not implemented ' + ast.key + ' ' + ast);
    }
  };

  whereCondObj = getWhereCondObj(ast);
  query.where(whereCondObj);
};
