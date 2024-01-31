---
title: neovim - The unfinished business
published: false
---

neovim - things you should know before you start, else you’ll go back to using VSCode

If you have time or nothing exciting going at work or you want your code editor to break like your production and you want to spend hours fixing it, you should try neovim. 

Also, if you move around fast on your computer screens, people assume you’re smart, but that’s not what makes you smart. Configure your neovim, I’ll consider you as smart. Let’s get started.

(okay, ThePrimeagen! if you ever see this, thank you. Forgive me for using VSCode.)

neovim - best IDE or should I say PDE - personal development environment. It’s not as bad as you think it is when freshly installed, but you can make it look better.

Plugin Manager - if you want to make neovim look, feel and function better, you need plugins. to manage them you need a plugin manager. There’s packer.nvim, lazy.nvim, etc

Whenever you want to add/change something to the neovim editor, like a color schemes or fuzzy finders, you have to install them using this Plugin manager.

Fuzzy Finder - fancy way of saying - ‘search button’, but there is not button here. Lets you search and get to those places fast and you don’t have to click. There’s telescope, harpoon(I guess).

vim key mapping - keyboard short cuts. this what makes you move faster and makes you look smart in your group, unless there’s another neovimmer who’s faster than you.

You can create your own obscure key maps and make your editor unusable to others (that’s why its called a PDE and not an IDE).

Tree Sitter - Yet another fancy word to say how does your editor properly highlight your code. Let me try to simplify it.

You write code in Python, so you know the syntax and I know that syntax. But for your overpowered editor, its just a text. So, to help your editor make sure you’re writing correct syntax, we need this tree sitter.

What tree sitter does is, break down your code according to grammar of your programming language and creates a parse tree. Based on this, it highlights your code. If you edit your code, it just updates part of the parse tree, that’s why it is fast.

If you want to know more, read this - https://thevaluable.dev/tree-sitter-neovim-overview/

If you don’t want to know any of this, just remember - make sure your tree sitter has parser for all programming languages you use(yes, including Haskell), otherwise no syntax highlighting.