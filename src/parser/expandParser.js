"use strict";

import Builder from 'sequelize-query-builder';
import filterParser from './filterParser';

// a small way to convert it to expected format internally
export default (query, expand) => {
  if( expand == null )
    return;

  let expands;
  let includes = [];
  //TODO: generic implementation; for now assuming precedence of , with subentities followed by / and may have filters in them
  const SPLIT_MULTIPLE_EXPANDS = ',';
  const SPLIT_MULTIPLE_PATHS = '/';

  expands = expand.split(SPLIT_MULTIPLE_EXPANDS);
  for(let i=0; i < expands.length; i++){
    let subQuery = new Builder();
    let item = expands[i];
    let subItems = expands[i].split(SPLIT_MULTIPLE_PATHS);
    let includeObj = {};
    let currentIncludeObj = includeObj;
    for(let j=0;j < subItems.length; j++){
      let subItem = subItems[j];
      if(subItem.indexOf('$filter') > 0){
        let arr = subItem.match(/(.+?)\(\$filter=(.+?)\)$/).map((s) => s.trim()).filter((n) => n);
        if(arr.length !== 3){
          return new Error("Syntax error at '#{subItem}'.");
        }
        filterParser(subQuery, arr[2]);
        currentIncludeObj.model = arr[1];
        currentIncludeObj.where = subQuery._where; 
      } else {
        currentIncludeObj.model = item;
      }
      if( j < subItems.length - 1){
        currentIncludeObj.include = [{}];
        currentIncludeObj = currentIncludeObj.include[0];
      }
    }
    includes.push(includeObj);
  }
  query.include(includes);
};
