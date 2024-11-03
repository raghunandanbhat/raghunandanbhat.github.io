+++
title = "TLDR - Google File System (2003)"
date = "2024-06-20"
draft = false
description = "extremly short summary of GFS"
taxonomies.tags = [
    "distributed systems",
]
+++
[original paper](https://static.googleusercontent.com/media/research.google.com/en//archive/gfs-sosp2003.pdf)

Scalable distributed file system for large distributed data-intensive applications.It is fault tolerant, runs on commodity hardware, provides high aggregate performance.

### Why?
- component failures are norms rather than the exception. they fail often, therefore constant monitoring, error detection, fault tolerance and automatic recovery is integral to the file system
- Files are huge by traditional standards and working with large number of them is a pain when it comes to I/O on these files. So it is important to consider I/O and block sizes when designing
- Files are mutated by appending rather than overwriting the existing data. Reads are usually sequential. Given this access pattern, appending becomes the focus of performance optimization, atomicity and caching.
- Co-designing apps and file system API benifits overall, considering the interaction between the files and applications

### Architecture
- Single Master and multiple Chunk Servers, that can be accessed by clinets
- Files are split into fixed size chunks (64 MB), each chunk is identified by 64-bit globally unique chunk_handle assigned by the Master
- Chunks are written in the local disk of the chunk servers.
- Master only stores the metadata of the chunk servers and chunks
- Each chunk is replicated(3-replicas by default) on multiple chunk-servers for reliability.

... unfinished
