"use strict";

import Builder from 'sequelize-query-builder'
import filterParser from './filterParser';

// a small way to convert it to expected format internally
export default (query, expand) => {
  if( expand == null )
    return;

  let expands;
  let includes = [];
  //TODO: '/' recursive include
  const SPLIT_MULTIPLE_EXPANDS = ',';

  expands = expand.split(SPLIT_MULTIPLE_EXPANDS);
  for(let i=0; i < expands.length; i++){
    let subQuery = new Builder();
    let item = expands[i];
    if(item.indexOf('$filter')){
      let arr = item.match(/(.+?)\(\$filter=(.+?)\)/).map((s) => s.trim()).filter((n) => n);
      if(arr.length !== 3){
        return new Error("Syntax error at '#{item}'.");
      }
      filterParser(subQuery, arr[2]);
      includes.push({model: arr[1], where: subQuery._where})
    } else {
      includes.push({model: item});
    }
  }
  query.include(includes)
};
