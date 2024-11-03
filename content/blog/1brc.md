+++
title = "1 Billion Row Challenge in Python"
date = "2024-01-23"
draft = false
description = ""
taxonomies.tags = [
    "python",
]
+++
On January 1st of this year, [Gunnar Morling](https://twitter.com/gunnarmorling) launched a new challenge known as the [1 Billion Row Challenge](https://github.com/gunnarmorling/1brc). The objective? To read and aggregate 1 billion rows from a text file as quickly as possible. While the challenge officially requires submissions in Java to be eligible for winning, Gunnar allowed participants to showcase solutions in other languages in the [Show & Tell](https://github.com/gunnarmorling/1brc/discussions/62) section. In this post, I'll detail my attempt at tackling this challenge using my language of choice: Python, and without relying on any external Python packages.

### **The Problem**
You have a text file named `measurements.txt` containing 1 billion rows. Each row consists of two values: a weather station name (city) and the recorded temperature for that city, separated by a semi-colon.
```
Hamburg;12.0
Bulawayo;8.9
Palembang;38.8
.....
```
You are supposed to read this file and print out `min`, `mean` and `max` temperature for each city in the following format.
```
{Abha=-23.0/18.0/59.2, Abidjan=-16.2/26.0/67.3, Abéché=-10.0/29.4/69.0, Accra=-10.1/26.4/66.4, ...}
```

### **Attempt 1: The Python Way of Doing Things**
We will use a straightforward method to read from the file and aggregate the values in a Python dictionary. For each city we encounter in the file, we will record the minimum and maximum temperature, as well as the sum and frequency of occurrences of that city in the file (which we need for calculating the mean).

We will read the text file line by line using Python's `readline()` method. This method operates like a generator and is lazy, meaning it reads only what is needed at the moment. Therefore, we do not need to load the entire 1 billion rows into memory, resulting in faster processing and reduced memory consumption.
```py
with open('measurements.txt') as f:
    for line in f:
        # process each line
```
This method is very readable and works best when reading fairly large files. However, in this case, we need something different and better. With this approach, I was able to read and solve the problem in approximately **870 seconds**. However, compared to Java solutions written at that time, which could solve it in **5 seconds**, this performance is a joke.

### **Attempt 2: Use multicores when you can**
The next obvious step is to use all the cores you have got to run the same process with chunks of data. Python supports multi processing and provides nice interface through `concurrent.futures` module.

Spawn multiple processes and make each of these processes to read 100 million lines from the file. Process-1 reads first 100 million lines, Process-2 reading next 100 million lines and so on. One nice aspect of this problem is we are just reading the file and not writing to it. That's one huge relief.

Managing the results from these processes is crucial. Fortunately, Python offers straightforward methods within `concurrent.futures` to gather results from multiple processes. We can then combine these results to construct a single Python dictionary.
```py
MAX_LINES = 1_000_000_000
MAX_LINES_PER_CHUNK = 100_000_000

def process_chunk(start, end):
    # read 100 million lines and process here
    # return the dictionary of {city : {min: , max: , sum: , count: ,}}

with concurrent.futures.ProcessPoolExecutor() as executor:
    chunk_results = [executor.submit(process_chunk, start, (start + MAX_LINES_PER_CHUNK)) for start in range(0, MAX_LINES, MAX_LINES_PER_CHUNK)]

    for future in concurrent.futures.as_completed(chunk_results):
        # combine the result into one big python dictionary
```
With multi processing, the run time came down to **~320 seconds**. That's a nice improvement.

### **Attempt 3: It's all bytes in the end**
In the last attempt, the idea of processing the files as chunks was correct. However, the approach we used was flawed. When reading line by line, there's no direct method in Python to jump to a specific line number. For instance, if you want to start reading from the 101st line, you must first loop through the preceding 100 lines, wasting CPU cycles.

To solve this issue, we need to adopt a different perspective. Instead of treating the file as a sequence of lines, we can view it as a stream of bytes. This shift in perspective allows us to utilize the `seek` function to skip to the exact byte position in the file. With this capability, the challenge becomes determining these positions efficiently.

We begin by dividing the total file size by the maximum number of CPU cores available to determine the size of each chunk. Each process should receive nearly equal amounts of data to process. However, there's a potential problem: we can't guarantee that a line ends at the exact `size_per_core` byte position. This means that we might end up in the middle of a line, reading an incomplete line.

To address this issue, we advance the position until we encounter a newline (`\n`) character, which signifies the end of a line. We consider this position as the end of the chunk and repeat this process for the rest of the file.
```py
def get_chunk_boundaries():
    f_size = os.stat(INPUT_FILE_PATH).st_size
    size_per_core = f_size // os.cpu_count()
    boundaries = []
    with io.open(INPUT_FILE_PATH, 'rb') as f:
        start_pos = 0
        end_pos = start_pos + size_per_core
        while end_pos < f_size:
            if (start_pos + size_per_core) < f_size:
                f.seek(size_per_core, os.SEEK_CUR)
                byte_char = f.read(1)
                while byte_char != b'' and byte_char != b'\n':
                    # print(f"char at {f.tell()}: {byte_char}")
                    byte_char = f.read(1)
                end_pos = f.tell()
            else:
                end_pos = f_size
            boundaries.append((start_pos, end_pos))
            # print(f"start: {start_pos}, end: {end_pos}, size-diff: {end_pos-start_pos}")
            start_pos = end_pos
    return boundaries
```

```py
def process_chunk(start, end):
    # process the chunk here

chunk_boundaries = get_chunk_boundaries()
with concurrent.futures.ProcessPoolExecutor(max_workers=os.cpu_count()) as executor:
    chunk_result_futures = [executor.submit(process_chunk, start, end) for start, end in chunk_boundaries]
    for future in concurrent.futures.as_completed(chunk_results):
        # combine the result into one big python dictionary
```
After establishing the boundaries of the file chunks, we process chunks with multiprocessing and aggregate the results. The task was completed in **162 seconds**.

### **Attempt 4: Last few drops of performance**
After exhausting the obvious methods to enhance performance, we delved into less conventional approaches. This is where things got a bit crazy - memory mapping, minimizing function calls, reducing exceptions, and branchless programming.

1. Memory map each chunk to a range of addresses within the address space of each process.
3. Instead of using built-in `min` and `max` functions, I opted for simple `if` statements.
2. Replaced the nested dictionaries used to store results with dictionaries of `lists`.

Despite the unconventional nature of these optimizations, they proved highly effective. The task was completed in 72 seconds. Increasing the number of processes to 16 reduced time to just **64 seconds**.

### **Failed attempts and Skill Issues**
During these attempts, I experimented with various other tricks and felt the 'skill issue' meme.
<p align="center">
    <img src="../../static/imgs/skill-issue.png"/>
</p>

### Multi-threading in Python
This realm of programming is fraught with risks, particularly if you're not keen on debugging concurrency issues. Also, Python is not multi-threaded by default; rather, you have to make it multi-threaded by disabling the infamous **Global Interpreter Lock (GIL)**. So, I cloned CPython, compiled it with `--disable-gil` and wrote a multi-threaded prpgram to process the file. The processing time doubled and I felt the 'skill issue' meme again.

### It's all bytes in the end but...
There's a limit. Instead of using `readline()` and splitting the line at `;`, read the file charcater by character and parsed the city and tempearture values. This method again increased processing time (obviously), yet I wanted to try it anyway (not a skill issue).

### **Final Thoughts**
Well, I nearly read the entire Python documentation (again) and still felt like there were better ways to accomplish the task in Python, which could potentially make it even faster. However, the [solution](https://github.com/raghunandanbhat/1brc) I implemented is a pretty good one.

In Java, there are significantly better and faster implementations, often involving impressive bit-shifting techniques. The winners of the challenge completed the task in an astonishing **1.5 seconds**. You can find their solutions in the challenge [repo](https://github.com/gunnarmorling/1brc) on GitHub. Also, there's a nice [write-up](https://tivrfoa.github.io/java/benchmark/performance/2024/02/05/1BRC-Timeline.html) up by [@tivrfoa](https://twitter.com/tivrfoa). I'm still wrapping my head around some of the implementations.
