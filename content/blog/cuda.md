+++
title = "Speed running CUDA"
date = "2025-02-27"
draft = true
description = ""
taxonomies.tags = [
    "gpu", "cuda"
]
+++
Let's start!

#### CPU vs GPU
- CPUs
  - CPUs are designed to minimize latency, i.e- to do a task as fast as possible.
  - Majority of the chip is dedicated to ALU (to exec operations) and a big cache (to hold more data near to CPU).
- GPUs
  - GPUs are designed to maximize throughput, i.e- to do as many tasks as possible at once.
  - Majority of chip is dedicated to have massive number of ALUs, so they can do a lot of operations at once. They are called CUDA cores.

#### How to use these massive number of CUDA cores?
- You can parallelize parts of the program and run them on these cores using threads.
- The programs/functions that these threads run are called CUDA Kernals.
- Each thread is mapped to a single CUDA core on GPU.

#### Host and Device
- Host => CPU + on chip memory
- Device => GPU + DRAM
- Use CPU for serial/sequential tasks, offload parallel tasks to GPU. This Host + Device is called Heterogeneous programming model.
- In NVIDIA land this programming model is called CUDA programming. It's set of C extensions that lets you do Heterogeneous programming on Nvidia GPUs.
