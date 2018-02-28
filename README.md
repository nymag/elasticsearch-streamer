# elasticsearch streamer

A command-line interface for streaming docs from Elatic indices and for ptuting docs into indices in bulk.

## Installation

`npm install -g elasticsearch-streamer`

## Usage

Saves all docs in Index A to a file:

```
ess get localhost:9200/a > b.txt
```

Put all docs in a file into index C:

```
ess put localhost:9200/c < b.txt
```

Moves docs from Index A to Index B:

```
ess get localhost:9200/a | ess put localhost:9200/b
```

## Commands

### get

Streams documents out of the specified Elastic index endpoint as JSON.

Options:

* `query`: stringified query JSON e.g. `{"term": {"foo": "bar"}}`

### put

Put documents (as JSON strings) from stdin into the specified Elastic index endpoint, and stream bulk results objects (JSON strings).

Options:

* `batch`: size of bulk batches. Default: `100`.

Bulk results object:

* `status`: String. `success` or `error`.
* `id`: String. The ID of the inserted document.
* `elasticHost`: String. The elastic host that the doc was put into.
* `elasticIndex`: String. The index that the document was put into.
* `error`: Object. The elastic bulk error.

## Tips

Use with [jq](https://stedolan.github.io/jq/) to parse and filter JSON.
