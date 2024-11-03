+++
title = "TLDR - Map Reduce (2004)"
date = "2024-06-24"
draft = false
description = "notes on map reduce paper"
taxonomies.tags = [
    "distributed systems",
]
+++
[paper](https://static.googleusercontent.com/media/research.google.com/en//archive/mapreduce-osdi04.pdf)

map reduce is a programming model and associated implementation to process large data sets. this was inspired from *map-reduce functionality in the functional programming languages*.

### Programming Model
- `map` functions take a key-value pair and to generate a set of intermediate key-value pair. This is a user written function that accepts a kv pair and generates a kv-pair
- The MapReduce library takes the intermediate result, groups them by the same intermediate key and passes it to `reduce` function
- `reduce` function takes a intermediate key-value pairs and merges all intermediate values associated with the same intermediate key
- this function is also written by user, which accepts the intermediate key `k` and a set of values for that key. it merges them into a smaller set of values.
- Typically input kv pair comes from a map-reduce step and the output is also consumed by another map-reduce step
- for ex: you have set of docs [doc_name, doc_contents]. pass it to `map` function, map splits the content and counts the words in the document, generating (word: 1) key value pair. this intermediate kv pair is sent to reduce `reduce` function, which adds the frequency of each word by combining results of word. The result of the reduce function is also a key-value pair, that could be sent to another set of map-reduce functions

```python
def map(key:str, value:str):
	# key: document name
	# value: document content
	for word in value:
		emit_intermediate(word, 1)

def reduce(key:str, values:[Iterator]):
	# key: a word from map
	# values: list of aggregated values from intermediate step
	# count of word
	freq = {}
	for k, vals in values.items():
		for v in vals:
			freq[k] = freq.get(k, 0) + int(v)
		emit(freq[k])
```

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/2f23d75d-8cd2-4d5a-9e68-9e5a290e391d/07f1b496-cf31-411d-9974-7c1811822995/Untitled.png)

### How it works
* map-reduce library splits the file into 16-64 MB chunks
* If there are **M** map tasks, **R** reducer tasks, controlled by the master
* master picks up a input split, assigns it to a free worker. Worker reads the file, parses it and passes it onto user defined map function. this map functions generates intermediate key-value pair are buffered in-memory
* Periodicallly, buffered pairs are written to local disk, partitioned into R regions. location of these are sent to master, who’s responsible for forwarding them to reduce workers
* when reducer is notified, it uses a RPC to read from the local disk of the map worker. it groups the data using based on the intermediate keys
* reduce worker iterates over the key, for each unique key, it passes the corresponding values to user’s reduce function. the output of the reduce function is appended to the output file
* When all map and reducer tasks are done, master wakes up the user program. at this point, the MapReduce function call in the user program returns the value. outputs are available in R different output files. these are generally passed onto another map reduce functions to further generate result

### Fault Tolerance:

#### Worker Failures
- Master maintains the state of each worker (idle, in-progress, completed).
- It periodically pings the worker to check if it is fine. If it receives no response, the map task assigned to it is reset and re-assigned to other available workers
- Failed workers are reset to idle state and work is assigned
- same process with reduce workers as well.
- If a map task at worker-A fails, and it is later executed by worker-B, all reduce workers will be notified of the re-execution. Any worker that has not read from worker-A, will now read from worker-B

#### Master Failure
- Master data structure is check-pointed periodically to store master’s state
- If the master fails, it uses the most recent checkpoint for recovery

Map-Reduce is just a programming model, supported by a master-worker style architecture. There are multiple use cases and enhancements done over this.

Advantages:
- Easy to use for anyone without parallel & distributed systems
- large-scale data processing made easy with parallellization
