const _ = require('lodash'),
  elasticsearch = require('elasticsearch'),
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

function putDocs(stream, elasticHost, elasticIndex, batch = 100) {
  const client = new elasticsearch.Client({host: elasticHost});

  return stream
    .batch(batch)
    .map(_.partialRight(docsToBatchActions, elasticIndex))
    .flatMap(batchActions => h(client.bulk({body: batchActions})))
    .flatMap(results => h(results.items))
    .map(resultItem => {
      const id = resultItem.create._id,
        index = resultItem.create._index,
        status = resultItem.create.status;

      if (status >= 200 && status < 300) {
        return {
          id,
          elasticIndex: index,
          status: 'success'
        };
      } else {
        return {
          status: 'error',
          id,
          elasticHost: elasticHost,
          elasticIndex: index,
          error: resultItem.create.error
        };
      }
    });
}

module.exports = putDocs;
