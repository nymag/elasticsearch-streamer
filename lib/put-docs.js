const _ = require('lodash'),
  elasticsearch = require('elasticsearch'),
  util = require('./util'),
  h = require('highland');

function docsToBatchActions(docs, index) {
  return docs.reduce((acc, doc) => {
    acc.push({
      create: {
        _index: index,
        _type: 'general',
        _id: doc._id
      }});
    acc.push(_.omitBy(doc, (value, key) => key.startsWith('_')));
    return acc;
  }, []);
}

function putDocs(stream, elastic, batch = 100) {
  const {host, index} = util.parseElastic(elastic),
    client = new elasticsearch.Client({host});

  return stream
    .batch(batch)
    .map(_.partialRight(docsToBatchActions, index))
    .flatMap(batchActions => h(client.bulk({body: batchActions})))
    .flatMap(results => h(results.items))
    .map(resultItem => {
      const id = resultItem.create._id,
        resultIndex = resultItem.create._index,
        status = resultItem.create.status;

      if (status >= 200 && status < 300) {
        return {
          id,
          elasticIndex: resultIndex,
          status: 'success'
        };
      } else {
        return {
          status: 'error',
          id,
          elasticHost: host,
          elasticIndex: resultIndex,
          error: resultItem.create.error
        };
      }
    });
}

module.exports = putDocs;
