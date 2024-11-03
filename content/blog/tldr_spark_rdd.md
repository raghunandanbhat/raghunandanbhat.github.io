+++
title = "TLDR - Spark and RDD (2010)"
date = "2024-07-26"
draft = false
description = "notes on RDD, Spark"
taxonomies.tags = [
    "distributed systems",
]
+++

[original RDD paper by matei zaharia](http://nil.csail.mit.edu/6.5840/2023/papers/zaharia-spark.pdf)

unified (distributed) engine  for large-scale data processing and analytics.
spark generalizes the map and reduce steps into a complete notion of multistep data flow graph.
it supports iterative applications on data. multiple map reduce operations loop over same data

Its a unified engine that makes large workload easy and fast

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/2f23d75d-8cd2-4d5a-9e68-9e5a290e391d/e5c84b3c-5d75-4288-a4a5-49d8681eae7e/Untitled.png)

Spark uses RDD

It does not execute every input provided by the user. It queues them into some list of tasks to be done in a manner of DAG - directed acyclic graph.

### Architecture
- master-worker architecture. master is called driver program and the other nodes are called worker nodes
- you create a `SparkContext`  object in your program, this is called driver program
- to run on a cluster, `SparkContext`  can connect to several types of cluster managers to allocate resources across application. this can be spark’s own standalone manager, Mesos, YARN, or Kubernetes.
- Once connected to cluster manager, spark acquires `executor` nodes in the cluster. this is where computations are done for your data
- next you can send your application code (JAR or python files passed to SparkContext) to the executors
- finally sparkcontext sends tasks to executors to run

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/2f23d75d-8cd2-4d5a-9e68-9e5a290e391d/dd116da8-2082-40f3-a4d6-d098ce928a02/Untitled.png)

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/2f23d75d-8cd2-4d5a-9e68-9e5a290e391d/8bcb38ba-2f2b-4b5f-a630-cc1f2c0b0eaa/Untitled.png)

- when you write a spark job, it’s called a spark application
- driver process takes the command from the user, analyze it and send it to executors to do the work.
- when actions are called, RDD’s lineage is used to construct a DAG and they are executed
- Spark scheduler does all this

### Resilient Distributed Dataset(RDD) - from the original paper
**Why Spark?**
- MapReduce was great for batch processing but users needed more
    - more complex, multi-pass algorithms
    - more interactive ad-hoc queries
    - more real-time stream processing
- the older frameworks provided abstraction over distributing workloads, some level of fault tolerance. Spark does more by providing abstraction for distributed in-memory computation

2 main inefficiencies:

- Data re-use is common in many iterative workloads like machine learning & graph algorithms. these applications re-use intermediate results across multiple computations [result between 2 map reduce jobs]
- no support for interactive querying of data. can’t run multiple adhoc queries on the same subset of data
- saving these intermediate states between 2 map-reduce step is an IO overhead and needs to be stored in stable storage.

figure below shows how the intermediate result is written to a DFS and again read from there

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/2f23d75d-8cd2-4d5a-9e68-9e5a290e391d/b3961cc3-4ff3-445a-b850-f1fbca50825a/Untitled.png)

How Spark Solves this?

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/2f23d75d-8cd2-4d5a-9e68-9e5a290e391d/ac935e42-fa8b-416c-8451-057d15edef64/Untitled.png)

Example operation:

```python
"""
load error messages from the a logfile stored in HDFS or any other file sytem
then interactively search for various patterns
"""

# base RDD of strings. a collection of lines from error logfile, now converted
# as an RDD
lines = spark.textFile("hdfs://....")

# filter out errors from the base RDD of just lines
# now we get a transformed RDD: errors
errors = lines.filter(lambda s: s.startswith("ERROR"))

# just the messages from error, assuming tab seperation
error_messages = errors.filter(lambda s: s.split('\t')[2])

# until this step, all are just transformations. none of these are executed
# and they are evaluated lzaily
messages.cache() # store the errors efficiently

# count how many errors are related to MySQL
# count() is an action - this kick starts the parallel execution
# tasks are sent out from  Driver to Workers, they do the task, store the result
# in cache (because we said so) and return result
messages.filter(lambda s: "MySQL" in s).count()

# now if we want to filter error messages of Redis, we can just use the
# cached messages, instead of running all the processes again
messages.filter(lambda s: "Redis" in s).count()
```

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/2f23d75d-8cd2-4d5a-9e68-9e5a290e391d/63c585d7-7c66-4bca-aa5d-b23ba9469f86/Untitled.png)

## RDD - Resilient Distributed Dataset

- RDD - its a distributed memory model that lets programmers perform in-memory computations on large cluster. this is the secret sauce behind efficient reuse of intermediate results
- RDDs are collection of objects that are distributed across different nodes, but you can interact with the data as if its on a single machine.
- they are built using parallel transformation such as map, filter etc. they can be reconstructed automatically when there;s failure

### Fault Tolerance in RDDs: RDDs track lineage info to rebuild lost data

RDD - fault-tolerant parallel data structures that let users explicitly persist intermediate results in memory, controlling their partitioning to optimize data placement and manipulate them with rich set of operators.

- Has coarse-grained transformations (map, filter etc) that apply the same operation to many data items.
- the transformations are logged and used to build a dataset (its lineage) rather than the actual data.
- so if any of RDD in the middle is lost, we have enough info recreate the same using the logged transformations & applying them to other RDDs

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/2f23d75d-8cd2-4d5a-9e68-9e5a290e391d/4b722e47-7533-4bed-81d7-a00a05fcc5e6/Untitled.png)

- RDDs are read-only, partitioned collection of records.
- they can be created either on
    - data in stable storage, or
    - from other RDDs
    - though operations called - transformations like map, filter and join
- users can control RDDs in 2 ways
    - persistence - if you want to reuse an RDD in future
    - partitioning
- Action operations include - count, collect, save, etc - they output the dataset to a storage system
- Computations are lazy, only actions trigger the execution

## Spark Runtime

- Includes a single Driver and multiple Workers

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/2f23d75d-8cd2-4d5a-9e68-9e5a290e391d/552bb9db-68a6-450e-9b16-c7b9ed228ec1/Untitled.png)

- developers write a driver program, that connects to to a cluster of workers
- driver defines one or more RDDs and invokes actions on them
- lineage is tracked on the driver program side as well.
- workers are the long lived processes that can store RDD partitions in RAM across operations

### Narrow & Wide Dependency

- dependency defines whether computation done one one worker node is shared with other nodes in the cluster
- Narrow Dependency: if a type of task submitted completes without interacting with other nodes or does not depend on the results of other nodes, they are called narrow dependencies
- Wide Dependency: after few narrow dependency steps, results are shared with other nodes, in order to further the computation. this is called wide dependency
- In wide dependency, intermediate RDDs are shared with other nodes; while in narrow dependency, its only used in the same machine

#### What happens when a worker node fails the spark job has wide dependency?

- the worker in the middle fails before computation is complete. now we need to compute all the narrow dependency steps that comes before wide dependency step across all the nodes
- this takes a lot of time and resources. this is solved persisting periodic checkpoints to file system like HDFS

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/2f23d75d-8cd2-4d5a-9e68-9e5a290e391d/65b38a84-01b0-4b95-a951-3c747471c4fe/Untitled.png)

### Spark Libraries

Spark Engine does all this. On top of this there are set of libraries like SparkSQL, SparkML, SparkStreaming, GraphX

These different processing can be combined

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/2f23d75d-8cd2-4d5a-9e68-9e5a290e391d/c58d57ae-b61f-4067-bd42-d6985d97b032/Untitled.png)

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/2f23d75d-8cd2-4d5a-9e68-9e5a290e391d/c6b937eb-fd64-4373-8006-f8cdc6843a06/Untitled.png)

### Spark Context vs Spark Session

#### SparkContext:

1. Origin: Introduced in early versions of Spark.
2. Purpose: It's the entry point for Spark functionality, mainly for RDD-based operations.
3. Scope: One SparkContext per JVM (Java Virtual Machine).
4. Usage: Used primarily with RDD API. considered low level API
5. Configuration: Requires explicit configuration of SparkConf.

#### SparkSession:

1. Origin: Introduced in Spark 2.0 as part of the unified API.
2. Purpose: Provides a single point of entry to interact with Spark functionality.
3. Scope: Multiple SparkSessions can exist in the same JVM.
4. Usage: Used with DataFrame and Dataset APIs, as well as SQL. also supports RDD via spark context
5. Configuration: Can be created with simpler builder methods.

### Why use Structured Spark APIs like DataFrames & DataSets instead of RDDs

- RDDs are very low level APIs of spark, so chance of writing inefficient code is high. Its like writing code in Assembly language.
- writing RDDs will give you control, but spark can make very little improvement on RDD level API code.

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/2f23d75d-8cd2-4d5a-9e68-9e5a290e391d/51ae25e8-d9c7-4f92-b6b1-51507bbccfa6/Untitled.png)

- Structured API allows you do things in more declarative ways. Optimizations are done by Spark.
- They are high level. Ease of use and readability.
- You write ‘What-to-do’ instead of ‘How-to-do’.
