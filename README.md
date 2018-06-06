# elasticsearch streamer

A programmatic and command-line utility for streaming docs from Elasticsearch indices and putting docs into indices in bulk.

## Installation

`npm install -g elasticsearch-streamer`

## Usage

Save all docs in Index A to a file:

    ess get localhost:9200/a > b.txt

Put all docs in a file into Index C:
    
    ess put localhost:9200/c < b.txt

Upsert all docs in a file into Index C:

    ess upsert localhost:9200/c < b.txt

Moves docs from Index A to Index B:
    
    ess get localhost:9200/a | ess put localhost:9200/b

Move docs from host1's index A to host2's index A:

    ess get host1:9200/a | ess put host2:9200

Move docs from host1's indices into the same indices at host2:

    ess get host1:9200 | ess put host2:9200

Stream all docs where `foo` is `bar`:

    ess get localhost:9200/a --search `{"body": {"query": {"term": {"foo": "bar"}}}}`

Delete all docs from an index:

    ess get localhost:9200/a | ess delete localhost:9200

## Commands

### get [endpoint]

Streams documents out of the specified Elastic index endpoint as JSON.

Options:

* `search`: Client search options as JSON, e.g. `{"body": {"query": {"term": {"foo": "bar"}}}}`. Passed directly to `client.search`; see [ElasticSearch's Javascript API docs](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-search). `scroll` defaults to `10s` and `size` to `100`.

### put [endpoint]

Put documents (as JSON strings) from stdin into the specified Elastic index endpoint, and stream bulk results objects (as JSON strings). This will overwrite existing documents.

Options:

* `batch`: size of bulk batches. Default: `100`.

### upsert [endpoint]

Same as `put`, but upserts documents instead.

* `batch`: size of bulk batches. Defaults: `100`.

### delete [endpoint]

Given a stream of documents from stdin, remove all documents with matching IDs from the specified Elastic index, and stream bulk results objects (as JSON strings).

Options:

* `batch`: size of bulk batches. Default: `100`.

## Tips

Use with [jq](https://stedolan.github.io/jq/) to parse and filter JSON.
