# Mini-Framework Documentation

## Overview

A simple JavaScript framework that makes building interactive web apps easy. No complex setup, no dependencies - just write your UI as JavaScript objects and let the framework handle the rest!

### What you get

- **Virtual DOM** - Describe your UI with JavaScript objects, get fast updates
- **Reactive State** - Change data, UI updates automatically
- **Routing** - Navigate between pages without page refreshes
- **Events** - Handle clicks, typing, and more with simple functions
- **Components** - Build reusable pieces of UI
- **Tiny** - No bloat, just what you need

## How it works

Write your UI as JavaScript objects instead of HTML. When your data changes, the framework figures out what to update. You focus on what your app should look like, not how to manipulate the DOM.

## Usage: Getting Started

```javascript
import { createApp } from "./framework/app.js";
import { createVirtualElement } from "./framework/dom.js";

// Create your app
const app = createApp("body");
app.setState({ count: 0 });

// Define how it looks
function renderApp() {
  const state = app.getState();
  return createVirtualElement("div", {}, "", [
    createVirtualElement("h1", {}, `Count: ${state.count}`, []),
    createVirtualElement(
      "button",
      {
        onclick: () => app.setState({ count: state.count + 1 }),
      },
      "Increment",
      []
    ),
  ]);
}

// Start it up
app.setRenderFunction(renderApp).init();
```

## Virtual Elements

### Creating Elements

```javascript
createVirtualElement(tag, attributes, innerText, children);
```

- `tag`: HTML tag name  
- `attributes`: Element attributes and events
- `innerText`: Text content (use `""` if no text)
- `children`: Array of child elements (use `[]` if empty)

```javascript
// Simple div
createVirtualElement("div", { class: "header" }, "", []);

// Div with text
createVirtualElement("h1", {}, "Hello World", []);

// Input with attributes
createVirtualElement("input", {
  class: "text-input",
  placeholder: "Enter text...",
  type: "text"
}, "", []);
```

### Adding Events

Events use the `on` prefix:

```javascript
// Button with click handler
createVirtualElement("button", {
  onclick: () => console.log("Clicked!")
}, "Click me", []);

// Input with keyboard handler
createVirtualElement("input", {
  onkeydown: (e) => {
    if (e.key === "Enter") {
      console.log("Enter pressed!");
    }
  }
}, "", []);
```

Available events: `onclick`, `onkeydown`, `onchange`, `onblur`, `ondblclick`, `onsubmit`

### Nesting Elements

```javascript
createVirtualElement("header", { class: "header" }, "", [
  createVirtualElement("h1", {}, "My App", []),
  createVirtualElement("nav", {}, "", [
    createVirtualElement("a", { href: "#/" }, "Home", []),
    createVirtualElement("a", { href: "#/about" }, "About", [])
  ])
]);
```

### Dynamic Lists

Use array methods to create lists:

```javascript
const items = ["apple", "banana", "orange"];

createVirtualElement("ul", {}, "", 
  items.map(item => 
    createVirtualElement("li", {}, item, [])
  )
);
```

## State Management

Your app's data lives in one place. When it changes, your UI updates automatically.

```javascript
// Set initial state
app.setState({ todos: [], filter: "all", nextId: 1 });

// Read state
const state = app.getState();

// Update state (triggers re-render)
app.setState({ filter: "completed" });

// Update without re-rendering
app.setState({ someData: newValue }, false);
```

**Conditional Rendering:**

```javascript
function renderMain(visibleTodos) {
  const state = app.getState();

  if (state.todos.length === 0) {
    return createVirtualElement("main", { style: "display: none;" }, "", []);
  }

  return createVirtualElement("main", { class: "main" }, "", [
    createVirtualElement("ul", { class: "todo-list" }, "", 
      visibleTodos.map(todo => renderTodoItem(todo))
    ),
  ]);
}
```

## Routing

Hash-based routing for single-page applications.

**Setup Routes:**

```javascript
app
  .addRoute("/", () => setFilter("all"))
  .addRoute("/active", () => setFilter("active"))
  .addRoute("/completed", () => setFilter("completed"));

function setFilter(filter) {
  app.setState({ filter: filter });
}
```

**Navigation Links:**

```javascript
createVirtualElement("ul", { class: "filters" }, "", [
  createVirtualElement("li", {}, "", [
    createVirtualElement("a", { href: "#/" }, "All", []),
  ]),
  createVirtualElement("li", {}, "", [
    createVirtualElement("a", { href: "#/active" }, "Active", []),
  ]),
]);
```

Routes are hash-based (e.g., `#/`, `#/active`). When the hash changes, the framework runs the matching route handler.

## API Reference

```javascript
// App Module (app.js)
import { createApp } from "./framework/app.js";
const app = createApp("body");
app.setState(newState, (triggerUpdate = true)); // Update state
app.getState(); // Read state
app.setRenderFunction(renderFn); // Set render function
app.addRoute(path, handler); // Add route
app.init(); // Start app

// DOM Module (dom.js)
import {
  createVirtualElement,
  focusElement,
  findElement,
  updateDom,
} from "./framework/dom.js";
createVirtualElement(tag, attributes, innerText, children);
focusElement(selector, (cursorPosition = "default"));
findElement(selector, (rootElement = null));
updateDom(topElement, attachElements);

// Route Module (route.js)
import { addRoute, executeRoute } from "./framework/route.js";
addRoute(url, handler);
executeRoute(url);

// State Module (state.js)
import { State, globalStorage } from "./framework/state.js";
const state = new State();
state.setState(newState, (triggerUpdate = true));
state.getState();
state.setUpdateCallback(callback);
```

That's it! You're ready to build awesome apps with the mini-framework. 🚀
From AJA! with love ❤️