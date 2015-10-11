"use strict";

// a small way to convert it to expected format internally
export default (query, expand) => {
  if( expand == null )
    return;

  const SPLIT_MULTIPLE_EXPANDS = ','  
  query.include(expand.split(SPLIT_MULTIPLE_EXPANDS))
};
