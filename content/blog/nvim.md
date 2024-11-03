+++
title = "neovim - Things you should know before you start"
date = "2023-12-09"
draft = false
description = "nvim absolute beginner basics"
taxonomies.tags = [
    "neovim",
    "IDE",
]
+++
If you have time or nothing exciting going at work or you want your code editor to break like your production and you want to spend hours fixing it, you should try neovim. Also, if you move around fast on your computer screens, people assume you’re smart, but that’s not what makes you smart. Configure your neovim, make it work and I’ll consider you smart. Trolling aside, let’s get started.

In all seriousness, these are the things you should know before you try to write your neovim config. This is not a guide to writing your neovim config, it's a step 0. It explains what's what and why you need it.

### neovim
Best IDE or should I say PDE - personal development environment. It's a VIM based text editor and if you have ever used a terminal, I' sure you know what VIM is. It's not as bad as you think it is when freshly installed, but you can make it better.

### Plugin Manager
If you want to make neovim look, feel and function better, you need plugins. To install and manage them you need a plugin manager. There’s packer.nvim, lazy.nvim, etc
Whenever you want to add/change something to the neovim editor, like a color schemes or fuzzy finders, you have to install them using this Plugin manager.

### Fuzzy Finder
Fancy way of saying - ‘search button’, except there is no button here. It lets you search and get to those places fast and you don’t have to click. There’s telescope, harpoon(not exactly, but something close).

### Tree-sitter
Yet another fancy word to say - language parser, it's a set of programming language parsers, so that your neovim can easily understand your code text and do certain things with it (like syntax highlighting, etc). Let me try to simplify it.
You write code in Python, you and I know that syntax. But for your overpowered editor, it's just a text. To make sure you’re writing correct syntax, we need this tree sitter.
What tree sitter does is, break down your code according to grammar of your programming language and creates a parse tree. Based on this, it highlights your code. If you edit your code, it just updates part of the parse tree, that’s why it is fast. If you want to know more, read [this](https://thevaluable.dev/tree-sitter-neovim-overview/).
If you don’t want to know any of this, just remember - make sure your tree sitter has parser for all programming languages you use(yes, including Haskell), otherwise no syntax highlighting.

### Language Server Protocol
Auto complete, jumpt to definition, find-references, renaming, refactoring and all other goodness of full fledged editor is enabled by LSP.

### vim key mapping
These are keyboard shortcuts. This what makes you move faster and makes you look smart in your group, unless there’s another neovimmer who’s faster than you. You can create your own obscure key maps and make your editor unusable to others (that’s why its called a PDE and not an IDE).

Now that you know the basics, go get started.
