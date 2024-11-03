+++
title = "TLDR - Hadoop and HDFS (2006)"
date = "2024-07-10"
draft = false
description = "extremly short summary of hadoop and HDFS"
taxonomies.tags = [
    "distributed systems",
]
+++
[source](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html)

inspired by MapReduce and Google File System

It consists of 2 main parts
- HDFS - hadoop distributed file system
- Hadoop MapReduce (impl of MapReduce programming model)

### Assumptions and Goals
- Hardware failure is norm rather than an exception, so you need to make your file system more resilient to failures
- Streaming Data Access
    - application that run on HDFS need streaming access to the data set. These applications are not typically run on traditional file systems.
    - HDFS is designed for batch processing rather than interactive use by users
    - emphasis is on high throughput rather than latency of data access
- Application that run on HDFS have large data sets, so it is tuned for large files
- HDFS applications need a write-once-read-many access models.
- Moving computation is cheaper than moving data
    - computation is much more efficient when it is done near the data on which it operates
    - this is true especially when size of the data set is huge
    - HDFS provides interfaces to for applications move closer to where data resides
- Portability across different hardware and software

### Architecture
- Follows a Master/Slave architecture
- there is a single master called - NameNode
    - that manages file system namespace and regulates accessibility to clients
    - maps blocks to respective DataNodes in the cluster
    - executes file system namespace operations like open, close, renaming files and directories
- HDFS provides file system namespace and allows user data to be stored in files.
- then there are DataNodes, one per node in the cluster which manages the storage that is attached to that node.
- Internally, file is split into one or more blocks (64MB) and they are stored in DataNodes.
- Read and Write requests from clients are sent to DataNodes
- DataNodes also creates creation, deletion and replication of blocks bases on the instruction from the NameNode

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/2f23d75d-8cd2-4d5a-9e68-9e5a290e391d/741156b5-e73e-4ab2-9ad5-95a2ab016f35/Untitled.png)

- Data Replication:
    - files are stored as sequence of blocks
    - blocks are replicated for tolerance. replication factor can be configured per file
    - replication factor can be specified at file creation and can be changed later
- Heartbeat: NameNode sends heartbeat signal to DataNodes to check if they are functioning properly. If there’s no response from a DataNode it is considered dead.
- Cluster Rebalancing: supports rebalancing schemes. A scheme might move data from one DataNode to another

### Drawbacks
- Stored data on disk or hard disks, which makes it slower. Every time when you need to do some calculations, we need to read the data from the disk, do the operation and store it back to disk
- Only supports Batch Processing. You need to wait for one batch to complete before you submit another batch
