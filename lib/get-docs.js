const ScrollStream = require('elasticsearch-scroll-stream'),
  h = require('highland'),
  elasticsearch = require('elasticsearch');

function getDocs(elasticHost, elasticIndex, {parse = true, query}) {
  const client = new elasticsearch.Client({host: elasticHost}),
    opts = {
      index: elasticIndex,
      scroll: '10s',
      size: '50'
    };

  if (query) opts.body = {query};

  return es = h(new ScrollStream(client, opts, ['_id']))
    .invoke('toString')
    .map(i => parse ? JSON.parse(i) : i)
}

module.exports = getDocs;
