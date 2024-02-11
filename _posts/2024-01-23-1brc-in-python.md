---
title: 1 Billion Row Challenge in Python
published: true
---

On January 1st of this year [Gunnar Morling](https://twitter.com/gunnarmorling) released a new challenge called [1 Billion Row Challenge](https://github.com/gunnarmorling/1brc). The challenge is to read and aggregate 1 billion rows from a text file as fast as possible. If you want to submit your entry and win the challenge, you should submit the solution in Java. However, he allowed submissions in other languages in [Show & Tell](https://github.com/gunnarmorling/1brc/discussions/62) section. This post is all about how I tried this challenge in my language of choice- Python without any Python packages.

### **The Problem**
You have a text file `measurements.txt` with 1 billion rows, where each row has 2 values - a weather station name(city) and recorded temperature for that city, seperrated by a semi-colon. 
```
Hamburg;12.0
Bulawayo;8.9
Palembang;38.8
.....
```
You are supposed to read this file and print out `min`, `mean` and `max` temperature for each city in the following format.
```
{Abha=-23.0/18.0/59.2, Abidjan=-16.2/26.0/67.3, Abéché=-10.0/29.4/69.0, Accra=-10.1/26.4/66.4,.........}
```

### **Attempt 1: The Python way of doing things**
Let's try the straightforward method of reading from file and aggregating the values in a python dictionary. For each city we read from the file, we record the minimum and maximum temperature as well as sum and frequency of that city in the file (we need mean). 

The text file is read line by line using python's `readline()` method. This method is like a generator and it's lazy. You don't have to read the entire 1 billion rows into memory, instead you read whatever is needed right now. This is fast and consumes less memory. 
```py
with open('measurements.txt') as f:
    for line in f:
        # process each line 
```
This is very readable and works best when reading fairly large files. But we need something  and better here. With this approach I was able to read and finish the problem in ~870 seconds. That's really bad compared to 5 second soltuions written in Java at that time.

### **Attempt 2: Use multicores when you can**
The next obvious step is to use all the cores you have got to run the same process with chunks of data. Python supports multi processing and provides nice interface through `concurrent.futures` module. 

Spawn multiple processes and make each of these processes to read 100 million lines from the file. Process-1 reads first 100 million lines, Process-2 reading next 100 million lines and so on, at the same time. One nice aspect of this problem is we are just reading the file and not writing to it. That's one huge relief. 

What we should handle here is results from these processes. Thankfully, python again has easy to use methods in `concurrent.futures` to capture all the results by multiple processes. We once again combine them to make one single python `dict`.
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
With multi processing, the run time came down to ~320 seconds. That's a nice improvement.

### **Attempt 3: It's all bytes in the end**
In the last attempt, the idea of processing the files as chunks was right. But the way we did it was wrong. If you start reading line by line, there is no way in python to jump to a certian line number. For example, if you want to read from 101st line, you first have to loop through first 100 lines and then start reading. Do you see the problem now? Just looping thruogh lines wastes CPU cycles.

To solve this, we need to see things differently. We look at this gaint file as stream of bytes. What changes now? You can skip to the exact byte you want in the file using `seek` function. Now that we can skip to exact position, how do we find these positions. 

We start by determining the size of each chunk. Each process should get nearly equal amount of data to process and this is enusured by dividing the total file size by the maximum number of CPU cores available - let this size be `size_per_core`. First chunk starts at 0 and ends at `size_per_core` byte, then the next starts at `size_per_core + 1` byte and so on. But there's a problem, there's no way we can be sure that a line ends at exact `size_per_core` byte. This means a we might end up in the middle of a line reading incomplete line.

To fix this, we advance the position till we get a newline (`\n`) character and conisder this as the end of the chunk. And repeat the same for the rest of the file. 
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
Once we have the boundaries of the file, process each chunk with multiple process and aggregate the result. The task finishes in 162 seconds. 

### **Attempt 4: Last few drops of performance**
After all the obvious ways to imporve the performance, we try the not-so-obvious ways. This is where things start to get crazy - memory mapping, avoiding function calls, reducing the number of exceptions and branchless executions. 
1. Memory map the a chunk to a range of addresses within the address space of each process.
2. Instead of using `min` and `max` functions, just use an `if` statement.
3. The python `dict` used to store the result was a dictionary of dictionarires. Replace them with dictionory of `list`. 

With all these circus, the task completes in 72 seconds and when the number of process is increased to 16, the task finished in **64 seconds**. 

### **Failed attempts and Skill Issues**
In between these attempts, I tried some other trciks and felt the skill issue meme.
<p align="center">
    <img src="../assets/skill-issue.png"/>
</p>

### Multi-threading in Python
This is a risky territory in programming and not for you if you don't want to debug concurrency bugs. Also, Python is not multi-threaded by default; rather, you have to make it multi-threaded by disabling the infamous- Global Interpreter Lock (GIL). So, I cloned CPython, compiled it with `--disable-gil` and wrote a multi-threaded prpgram to process the file. The processing time doubled and I realized my skill issue.

### It's all bytes in the end but, 
There's a limit. Instead of using `readline()` and splitting the line at `;`, read the file charcater by character and parsed the city and tempearture values. This method again increased processing time and yet I wanted to try it anyway (not a skill issue).

### **Final Thoughts**
Well, I alomst read the entire Python documentation (again) and felt the skill issues. There could be better ways to do it in Python and make it even faster, but the solution I implemented is a pretty good one. 

There are way better and faster implementations in Java and awesome bit shifting magic. The winners finished the task in **1.5 seconds**, you can find them in the challenge [repo](https://github.com/gunnarmorling/1brc) on GitHub. Also, there's a nice [write-up](https://tivrfoa.github.io/java/benchmark/performance/2024/02/05/1BRC-Timeline.html) up by [@tivrfoa](https://twitter.com/tivrfoa). I'm still wrapping my head around some of top implementations. 