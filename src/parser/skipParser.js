"use strict";

import { min } from 'lodash';

// ?$skip=10
// ->
// query.skip(10)
// TODO: see if we need maxSkip, making it very high for now
export default (query, skip = 0, maxSkip = 100000000) => {
  if (isNaN(+skip)) {
    return;
  }
  skip = min([maxSkip, skip]);
  if (skip < 0) {
    return;
  }
  query.skip(skip);
};
