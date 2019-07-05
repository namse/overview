# Overview

Overlay System using Electorn.js

# Architecture

(Current Architecture)

1 BrowserWindow : N Frame
1 Frame : M FrameComponents

- MainBrowserWindow
  - Frame 1
    - FrameComponent 1
    - FrameComponent 2
    - FrameComponent 3
    - ...
  - Frame 2
    - FrameComponent 1
    - FrameComponent 2
    - FrameComponent 3
    - ...
  ...

(Next Architecture)

1 Overview(Node.js Core) : N FrameWindows (Browser Window)
1 FrameWindow : 1 Frame
1 Frame : M FrameComponents

- OverView(Node.js Core)
  - FrameWindow 1
    - Frame
      - FrameComponent 1
      - FrameComponent 2
      - FrameComponent 3
      - ...
  - FrameWindow 2
    - Frame
      - FrameComponent 1
      - FrameComponent 2
      - FrameComponent 3
  - ...

