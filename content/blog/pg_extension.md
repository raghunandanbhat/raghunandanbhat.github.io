+++
title = "How Postgres Extensions Actually work"
date = "2025-01-20"
draft = false
description = ""
taxonomies.tags = [
    "database"
]
+++

PostgreSQL extensions allow developers to modify or extend the behavior of the database server without changing its core source code. One of the key mechanisms used in extensions is hooks, which provide predefined points in the PostgreSQL code where custom logic can be injected. In this post, we'll explore how hooks work in PostgreSQL extensions and how they are initialized and called.

### 1. Hooks in PostgreSQL Architecture

Hooks in PostgreSQL are implemented as extern function pointers within its core code. These hooks enable extensions to override or enhance specific database operations by assigning custom functions to them.

For example, PostgreSQL provides a `planner_hook` that can modify the query planning process:

```c++
typedef void (*planner_hook_type) (Query *parse, int cursorOptions, ParamListInfo boundParams);
extern PGDLLIMPORT planner_hook_type planner_hook;
```

Here, `planner_hook` is a function pointer that extensions can assign to their custom function to alter query planning behavior.

### 2. Initialization in the Extension

Hooks in PostgreSQL extensions are typically initialized inside a dedicated function, such as `InitHooks()`. This function assigns custom functions to the appropriate hooks while preserving the original behavior.

Example:
```c++
static planner_hook_type prev_planner_hook = NULL;

void InitHooks(void) {
    prev_planner_hook = planner_hook; // Save the original hook
    planner_hook = my_custom_planner_hook;
}
```

Here, the original `planner_hook` (if any) is stored for later use, and `planner_hook` is assigned to `my_custom_planner_hook`.

### 3. How PostgreSQL Calls Hooks

When PostgreSQL executes an operation with a hook available (e.g., planning, execution, transaction handling), it checks if the hook function pointer is set. If set, PostgreSQL calls the assigned function instead of executing its default behavior.

For example, during query planning:
```c++
if (planner_hook)
    return (*planner_hook)(parse, cursorOptions, boundParams);
else
    return standard_planner(parse, cursorOptions, boundParams);
```

If an extension has set `planner_hook`, PostgreSQL calls `my_custom_planner_hook()`. Otherwise, it defaults to `standard_planner()`.

### 4. Registering `InitHooks()`

The `InitHooks()` function is typically called when the extension is initialized. This can be done in two ways:

Via the `_PG_init()` Function

If your extension uses the `shared_preload_libraries` mechanism, PostgreSQL will call `_PG_init()` when the server loads the extension. You can call `InitHooks()` from within `_PG_init()`.

Example:
```c++
void _PG_init(void) {
    InitHooks();
}
```

During Extension Execution

If hooks need to be initialized dynamically, you might call `InitHooks()` from an SQL function or another entry point in your extension.

### 5. Example: Planner Hook Implementation

Here’s an example of a planner hook implementation:
```c++
static PlannedStmt *my_custom_planner_hook(Query *parse, int cursorOptions, ParamListInfo boundParams) {
    elog(INFO, "Custom planner hook called");
    // Optionally call the original planner
    if (prev_planner_hook)
        return prev_planner_hook(parse, cursorOptions, boundParams);
    else
        return standard_planner(parse, cursorOptions, boundParams);
}

void InitHooks(void) {
    prev_planner_hook = planner_hook; // Save the original hook
    planner_hook = my_custom_planner_hook; // Set the custom hook
}

void _PG_init(void) {
    InitHooks();
}
```
### 6. What Happens During Query Execution?

During query processing, PostgreSQL goes through multiple stages, including parsing, planning, and execution. At each stage, it checks if a corresponding hook is set. If a hook is assigned by an extension, the custom function executes, allowing modifications or additional logging.
