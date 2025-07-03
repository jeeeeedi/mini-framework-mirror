# Mini-Framework Documentation

## Overview

A lightweight JavaScript framework for building interactive web applications with virtual DOM, reactive state management, client-side routing, and declarative event handling.

### Key Features

- **Virtual DOM**: Efficient DOM updates through JavaScript object representation
- **Reactive State**: Automatic UI re-rendering when state changes
- **Client-Side Routing**: Hash-based navigation for single-page applications
- **Event Management**: Declarative event handling with automatic cleanup
- **Component-Based**: Modular, reusable UI components
- **Lightweight**: No external dependencies, minimal footprint

### Architecture

The framework consists of four core modules:

- **`app.js`**: Application lifecycle and initialization
- **`dom.js`**: Virtual DOM creation and rendering
- **`state.js`**: Global state management with reactive updates
- **`route.js`**: Client-side routing and navigation

## How It Works

### Virtual DOM System

Instead of directly manipulating the DOM, you describe your UI as JavaScript objects. When state changes, the framework efficiently updates only the necessary DOM elements.

**Why Virtual DOM?**

- **Performance**: Batches DOM updates for better efficiency
- **Predictability**: Declarative approach makes code easier to understand
- **Consistency**: Same input always produces the same output

### Reactive State Management

State changes automatically trigger UI re-renders. You describe what your UI should look like for any given state, and the framework handles DOM synchronization.

**Why Reactive Updates?**

- **Automatic Sync**: No manual DOM manipulation needed
- **Single Source of Truth**: All data flows from centralized state
- **Predictable**: State flows down, events flow up

## Quick Start

```javascript
import { createApp } from "./framework/app.js";
import { createVirtualElement } from "./framework/dom.js";

// 1. Create app and initialize state
const app = createApp("body");
app.setState({ count: 0 });

// 2. Define render function
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

// 3. Start the app
app.setRenderFunction(renderApp).init();
```

## Core API

### Creating Virtual Elements

```javascript
createVirtualElement(tag, attributes, innerText, children);
```

**Parameters:**

- `tag` (string): HTML tag name
- `attributes` (object): Element attributes and event handlers
- `innerText` (string): Text content (use empty string `""` if no text)
- `children` (array): Child virtual elements (always required, use `[]` if empty)

**Creating a Simple Div:**

```javascript
// From ToDoApp.js
createVirtualElement("div", { class: "header" }, "", []);
```

**Creating a Div with Text:**

```javascript
// From ToDoApp.js
createVirtualElement("h1", {}, "todos", []);
```

### Adding Attributes

Pass attributes as an object to `createVirtualElement()`:

```javascript
// From ToDoApp.js - Input with multiple attributes
createVirtualElement(
  "input",
  {
    class: "new-todo",
    placeholder: "What needs to be done?",
    autofocus: "",
  },
  "",
  []
);
```

**Common Attributes:**

```javascript
{ class: "my-class" }           // CSS classes
{ id: "unique-id" }             // Element ID
{ "data-id": "123" }            // Data attributes
{ type: "checkbox", checked: true }  // Form attributes
{ style: "display: block;" }    // Inline styles
{ for: "input-id" }             // Label associations
```

### Adding Events to Elements

Events use the `on` prefix followed by the event name:

**Button Click Event:**

```javascript
// From ToDoApp.js - Delete button
createVirtualElement(
  "button",
  {
    class: "destroy",
    onclick: () => deleteTodo(todo.id),
  },
  "",
  []
);
```

**Keyboard Events:**

```javascript
// From ToDoApp.js - Enter key handling
createVirtualElement(
  "input",
  {
    class: "new-todo",
    onkeydown: (e) => {
      if (e.key === "Enter" && e.target.value.trim()) {
        addTodo(e.target.value.trim());
        e.target.value = "";
      }
    },
  },
  "",
  []
);
```

**Available Events:** `onclick`, `onkeydown`, `onchange`, `onblur`, `ondblclick`, `onsubmit`

### Nesting Elements

Pass child elements in the `children` array:

```javascript
// From ToDoApp.js - Nested structure
createVirtualElement("header", { class: "header" }, "", [
  createVirtualElement("h1", {}, "todos", []),
  createVirtualElement(
    "input",
    {
      class: "new-todo",
      placeholder: "What needs to be done?",
    },
    "",
    []
  ),
]);
```

**Complex Nesting Example:**

```javascript
// From ToDoApp.js - Footer with conditional content
createVirtualElement("footer", { class: "footer" }, "", [
  createVirtualElement("span", { class: "todo-count" }, "", [
    createVirtualElement("strong", {}, activeCount.toString(), []),
    createVirtualElement("span", {}, ` ${itemText} left!`, []),
  ]),
  createVirtualElement("ul", { class: "filters" }, "", [
    createVirtualElement("li", {}, "", [
      createVirtualElement("a", { href: "#/" }, "All", []),
    ]),
    createVirtualElement("li", {}, "", [
      createVirtualElement("a", { href: "#/active" }, "Active", []),
    ]),
    createVirtualElement("li", {}, "", [
      createVirtualElement("a", { href: "#/completed" }, "Completed", []),
    ]),
  ]),
  // Conditionally include clear button
  ...(completedCount > 0
    ? [
        createVirtualElement(
          "button",
          {
            class: "clear-completed",
            onclick: clearCompleted,
          },
          "Clear completed",
          []
        ),
      ]
    : []),
]);
```

### Dynamic Lists

Use JavaScript array methods to create lists:

```javascript
// From ToDoApp.js - Rendering todo list
createVirtualElement(
  "ul",
  { class: "todo-list" },
  "",
  visibleTodos.map((todo) =>
    createVirtualElement("li", { "data-id": todo.id.toString() }, "", [
      createVirtualElement("label", {}, todo.title, []),
    ])
  )
);
```

## State Management

Reactive state automatically triggers UI updates when changed.

**Basic State Operations:**

```javascript
// From ToDoApp.js - Initialize state
app.setState({ todos: [], filter: "all", nextId: 1 });

// Read state
const state = app.getState();

// Update state (triggers re-render by default)
app.setState({ filter: "completed" });
app.setState({ todos: [...state.todos, newTodo], nextId: state.nextId + 1 });

// Update state without triggering re-render
app.setState({ someData: newValue }, false);
```

**State-Driven Rendering:**

```javascript
// From ToDoApp.js - Conditional rendering based on state
function renderMain(visibleTodos) {
  const state = app.getState();

  if (!state.todos || state.todos.length === 0) {
    return createVirtualElement(
      "main",
      {
        class: "main",
        style: "display: none;",
      },
      "",
      []
    );
  }

  return createVirtualElement(
    "main",
    {
      class: "main",
      style: "display: block;",
    },
    "",
    [
      createVirtualElement(
        "ul",
        { class: "todo-list" },
        "",
        visibleTodos.map((todo) => renderTodoItem(todo))
      ),
    ]
  );
}
```

## Routing

Hash-based routing for single-page applications.

**Setup Routes:**

```javascript
// From ToDoApp.js
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
// From ToDoApp.js - Creates clickable filter links
createVirtualElement("ul", { class: "filters" }, "", [
  createVirtualElement("li", {}, "", [
    createVirtualElement("a", { href: "#/" }, "All", []),
  ]),
  createVirtualElement("li", {}, "", [
    createVirtualElement("a", { href: "#/active" }, "Active", []),
  ]),
]);
```

**How Routing Works:**

- Routes are hash-based (e.g., `#/`, `#/active`)
- When hash changes, the framework automatically executes the matching route handler
- If no route matches, defaults to the `/` route
- Route handlers typically update application state to change the UI

## Framework Internals

### How It Works

1. **Virtual DOM**: `createVirtualElement()` creates JavaScript objects representing DOM elements
2. **State Changes**: `app.setState()` triggers automatic re-rendering via update callbacks
3. **DOM Updates**: `updateDom()` converts virtual elements to real DOM and replaces content completely
4. **Routing**: Hash changes trigger route handlers which update state
5. **Event Binding**: Event handlers are attached when virtual elements become real DOM elements

### Why This Design?

- **Virtual DOM**: Enables predictable, declarative UI programming
- **Reactive State**: Eliminates manual DOM manipulation and keeps UI in sync
- **Component Functions**: Promotes code reusability and organization
- **Hash Routing**: Enables navigation without page refreshes

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

This documentation provides everything needed to start building applications with the mini-framework!
