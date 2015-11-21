"use strict";

// a small way to convert it to expected format internally
export default (query, search) => {
  if( search == null )
    return;
  query.where('q').equals(search);
};
