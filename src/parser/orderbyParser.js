"use strict";

// ?$skip=10
// ->
// query.skip(10)
export default (query, $orderby) => {
  return new Promise((resolve, reject) => {
    if (!$orderby) {
      return resolve();
    }

    let order = {};
    let orderbyArr = $orderby.split(',');

    orderbyArr.map((item) => {
      let data = item.trim().split(' ');
      if(data.length > 2) {
        return reject(`odata: Syntax error at '${$orderby}', it's should be like 'ReleaseDate asc, Rating desc'`);
      }
      let key = data[0].trim();
      let value = data[1] || 'asc';
      order[key] = value;
    });
    query.sort(order);
    resolve();
  });
};
