'use strict';

const _ = require('lodash'),
  util = require('./util'),
  h = require('highland'),
  { DEFAULT_BATCH_SIZE, DEFAULT_TYPE } = require('./constants');

/**
 * Transform an array of docs into an array of bulk actions.
 * @param  {Object[]} docs
 * @param  {string} index Index each doc will be put into
 * @return {Object[]}
 */
function docsToBulkActions(docs, index) {
  return docs.reduce((acc, doc) => {
    acc.push(
      {
        index: {
          _index: index || doc._index,
          _type: doc._type || DEFAULT_TYPE,
          _id: doc._id
        }
      },
      doc._source
    );
    return acc;
  }, []);
}

/**
 * Given a stream of Elastic docs, insert these documents into the specified
 * Elastic endpoint.
 * @param  {Stream} stream of Elastic docs (objects)
 * @param  {string} elastic Elastic endpoint e.g. localhost:9200/foo
 * @param  {Object} [options]
 * @param  {number} [options.batch] Number of items to include in each bulk req
 * @return {Stream} of bulk results
 */
function putDocs(stream, elastic, {batch = DEFAULT_BATCH_SIZE, requestTimeout} = {}) {
  const {host, index} = util.parseElastic(elastic),
    client = util.getEsClient({host, requestTimeout});

  return stream
    .batch(batch)
    .map(_.partialRight(docsToBulkActions, index))
    .flatMap(batchActions => h(client.bulk({body: batchActions})))
    .flatMap(results => h(results.items));
}

module.exports = putDocs;
