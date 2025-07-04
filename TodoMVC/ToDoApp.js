/**
 * @fileoverview TodoMVC application implementation using the mini-framework.
 * This file contains the complete TodoMVC application with state management,
 * routing, and virtual DOM rendering.
 */

import { createVirtualElement, focusElement } from "../framework/dom.js";
import { createApp } from "../framework/app.js";

/**
 * Main application instance created with the mini-framework
 * @type {Object}
 */
const app = createApp("body");
let editHandled = false;

/**
 * Initialize TodoMVC application state
 * @typedef {Object} TodoState
 * @property {Array<Todo>} todos - Array of todo items
 * @property {string} filter - Current filter: "all", "active", or "completed"
 * @property {number} nextId - Next available ID for new todos
 * @property {number|null} editingId - ID of the todo currently being edited
 * @property {number|null} focusEditTodo - ID of the todo that should receive focus
 */
app.setState({
  todos: [],
  filter: "all",
  nextId: 1,
  editingId: null,
  focusEditTodo: null,
});

/**
 * Todo item type definition
 * @typedef {Object} Todo
 * @property {number} id - Unique identifier for the todo
 * @property {string} title - The todo text content
 * @property {boolean} completed - Whether the todo is completed
 */

/**
 * Set up application routing with filter handlers
 */
app
  .addRoute("/", () => setFilter("all"))
  .addRoute("/active", () => setFilter("active"))
  .addRoute("/completed", () => setFilter("completed"));

/**
 * Sets the current todo filter and updates application state
 * @param {string} filter - The filter to apply: "all", "active", or "completed"
 */
function setFilter(filter) {
  app.setState({ filter: filter });
}

/**
 * Main application render function that returns the complete UI structure
 * @returns {Array<Object>} Array of virtual elements including sidebar, main app, and footer
 */
function renderApp() {

  const state = app.getState();

  const visibleTodos = getFilteredTodos(state.todos, state.filter);

  return [
    createVirtualElement("aside", { class: "learn" }, "", sidebar()),
    createVirtualElement("section", { class: "todoapp" }, "", [
      renderHeader(),
      renderMain(visibleTodos),
      renderFooter(),
    ]),
    renderInfo(),
  ];
}

/**
 * Renders the header section with title and new todo input
 * @returns {Object} Virtual element representing the header
 */
function renderHeader() {
  const state = app.getState();

  return createVirtualElement("header", { class: "header" }, "", [
    createVirtualElement("h1", {}, "todos", []),
    createVirtualElement(
      "div",
      { class: "input-container" },
      "",
      [
        createVirtualElement(
          "input",
          {
            class: "new-todo",
            id: "todo-input",
            type: "text",
            "data-testid": "text-input",
            placeholder: "What needs to be done?",
            value: "",
            autofocus: "",
            onkeydown: handleNewTodoKeydown,
          },
          "",
          []
        ),
        createVirtualElement(
          "label",
          {
            class: "visually-hidden",
            for: "todo-input",
          },
          "New Todo Input",
          []
        ),
      ]
    ),
  ]);
}

/**
 * Handles keydown events for the new todo input field
 * Creates a new todo when Enter is pressed with valid input
 * @param {KeyboardEvent} e - The keyboard event
 */
function handleNewTodoKeydown(e) {
  if (e.key === "Enter" && e.target.value.trim()) {
    if (addTodo(e.target.value.trim())) {
      e.target.value = "";
      setTimeout(() => {
        focusElement(".new-todo");
      }, 0);
    }
  }
}

/**
 * Renders the main section containing the todo list and toggle-all functionality
 * @param {Array<Todo>} visibleTodos - Array of todos to display based on current filter
 * @returns {Object} Virtual element representing the main section
 */
function renderMain(visibleTodos) {
  const state = app.getState();

  if (!state.todos || state.todos.length === 0) {
    return createVirtualElement(
      "main",
      { class: "main", style: "display: none;" },
      "",
      []
    );
  }

  const allCompleted =
    state.todos.length > 0 && state.todos.every((todo) => todo.completed);

  return createVirtualElement(
    "main",
    { class: "main", style: "display: block;" },
    "",
    [
      createVirtualElement("div", { class: "toggle-all-container" }, "", [
        createVirtualElement(
          "input",
          {
            id: "toggle-all",
            class: "toggle-all",
            type: "checkbox",
            checked: allCompleted,
            onchange: handleToggleAll,
          },
          "",
          []
        ),
        createVirtualElement(
          "label",
          {
            class: "toggle-all-label",
            for: "toggle-all",
          },
          "Mark all as complete",
          []
        ),
      ]),
      createVirtualElement(
        "ul",
        { class: "todo-list" },
        "",
        (visibleTodos || []).map((todo) => renderTodoItem(todo))
      ),
    ]
  );
}

/**
 * Renders an individual todo item with toggle, edit, and delete functionality
 * @param {Todo} todo - The todo item to render
 * @returns {Object} Virtual element representing a single todo item
 */
function renderTodoItem(todo) {
  const state = app.getState();
  const isEditing = state.editingId === todo.id;
  const classes = [];
  if (todo.completed) classes.push("completed");
  if (isEditing) classes.push("editing");

  const children = [
    createVirtualElement("div", { class: "view" }, "", [
      createVirtualElement(
        "input",
        {
          class: "toggle",
          type: "checkbox",
          checked: todo.completed,
          onclick: () => toggleTodo(todo.id),
        },
        "",
        []
      ),
      createVirtualElement(
        "label",
        {
          ondblclick: () => startEditing(todo.id),
        },
        todo.title,
        []
      ),
      createVirtualElement(
        "button",
        {
          class: "destroy",
          onclick: () => deleteTodo(todo.id),
        },
        "",
        []
      ),
    ]),
  ];

  if (isEditing) {
    children.push(
      createVirtualElement(
        "input",
        {
          class: "edit",
          value: todo.title,
          onkeydown: (e) => handleEditKeydown(e, todo.id),
          onblur: () => {
            if (editHandled) {
              editHandled = false;
              return;
            }
            editHandled = false;
            app.setState({editingId: null, focusEditTodo: null})
            console.log("onblur activated");
          }
        },
        "",
        []
      )
    );
  }

  return createVirtualElement(
    "li",
    {
      "data-id": todo.id.toString(),
      class: classes.join(" "),
    },
    "",
    children
  );
}

/**
 * Handles the toggle-all checkbox change event
 */
function handleToggleAll() {
  toggleAll();
}

/**
 * Handles keydown events during todo editing
 * @param {KeyboardEvent} e - The keyboard event
 * @param {number} todoId - ID of the todo being edited
 */
function handleEditKeydown(e, todoId) {
  if (e.key === "Enter") {

    if (editHandled) return;

    editHandled = true;
    editTodo(todoId, e.target.value);
    e.preventDefault();
    e.stopPropagation();
  }
  if (e.key === "Escape") {
    app.setState({
      editingId: null,
      focusEditTodo: null,
    });
  }
}

/**
 * Renders the footer section with todo count, filters, and clear completed button
 * @returns {Object} Virtual element representing the footer
 */
function renderFooter() {
  const state = app.getState();

  if (!state.todos || state.todos.length === 0) {
    return createVirtualElement(
      "footer",
      { class: "footer", style: "display: none;" },
      "",
      []
    );
  }

  const activeCount = (state.todos || []).filter(
    (todo) => !todo.completed
  ).length;
  const completedCount = (state.todos || []).filter(
    (todo) => todo.completed
  ).length;
  const itemText = activeCount === 1 ? "item" : "items";

  return createVirtualElement(
    "footer",
    { class: "footer", style: "display: block;" },
    "",
    [
      createVirtualElement("span", { class: "todo-count" }, "", [
        createVirtualElement("strong", {}, activeCount.toString(), []),
        createVirtualElement("span", {}, ` ${itemText} left!`, []),
      ]),
      createVirtualElement("ul", { class: "filters" }, "", [
        renderFilterLink("All", "#/", state.filter === "all"),
        renderFilterLink("Active", "#/active", state.filter === "active"),
        renderFilterLink(
          "Completed",
          "#/completed",
          state.filter === "completed"
        ),
      ]),
      completedCount > 0
        ? createVirtualElement(
            "button",
            {
              class: "clear-completed",
              style: "display: block;",
              onclick: clearCompleted,
            },
            "Clear completed",
            []
          )
        : createVirtualElement(
            "button",
            {
              class: "clear-completed",
              style: "display: none;",
            },
            "",
            []
          ),
    ].filter(Boolean)
  );
}

/**
 * Helper function to render filter navigation links
 * @param {string} text - Display text for the link
 * @param {string} href - URL hash for the link
 * @param {boolean} isSelected - Whether this filter is currently active
 * @returns {Object} Virtual element representing a filter link
 */
function renderFilterLink(text, href, isSelected) {
  const linkAttributes = { href: href };
  if (isSelected) {
    linkAttributes.class = "selected";
  }

  return createVirtualElement("li", {}, "", [
    createVirtualElement("a", linkAttributes, text, []),
  ]);
}

/**
 * Renders the sidebar with framework information and links
 * @returns {Array<Object>} Array of virtual elements representing the sidebar content
 */
function sidebar() {
  return [
    createVirtualElement("header", {}, "", [
      createVirtualElement("h3", {}, "Mini-Framework", []),
      createVirtualElement("span", { class: "source-links" }, "", [
        createVirtualElement("h5", {}, "Usage", []),
        createVirtualElement(
          "a",
          {
            href: "https://01.gritlab.ax/git/atouba/mini-framework/src/branch/main/mini-framework-documentation.md",
          },
          "Documentation",
          []
        ),
      ]),
    ]),
    createVirtualElement("hr", {}, "", []),
    createVirtualElement("blockquote", { class: "quote speech-bubble" }, "", [
      createVirtualElement(
        "p",
        {},
        "A lightweight framework for building interactive web applications with virtual DOM creation, efficient DOM diffing, event management, client-side routing, and reactive state updates.",
        []
      ),
      createVirtualElement("footer", {}, "", [
        createVirtualElement(
          "a",
          { href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
          "Learn JavaScript",
          []
        ),
      ]),
    ]),
    createVirtualElement("hr", {}, "", []),
    createVirtualElement("h4", {}, "Development Team", []),
    createVirtualElement("ul", {}, "", [
      createVirtualElement("li", {}, "", [
        createVirtualElement("a", { href: "#" }, "Anass", []),
      ]),
      createVirtualElement("li", {}, "", [
        createVirtualElement("a", { href: "#" }, "Anastasia", []),
      ]),
      createVirtualElement("li", {}, "", [
        createVirtualElement("a", { href: "#" }, "Jedi", []),
      ]),
    ]),
    createVirtualElement("footer", {}, "", [
      createVirtualElement("hr", {}, "", []),
      createVirtualElement(
        "em",
        {},
        "If you have other helpful links to share, or find any of the links above no longer work, please ",
        []
      ),
      createVirtualElement(
        "a",
        { href: "https://01.gritlab.ax/git/atouba/mini-framework/issues" },
        "let us know",
        []
      ),
    ]),
  ];
}

/**
 * Renders the info footer section with instructions and credits
 * @returns {Object} Virtual element representing the info footer
 */
function renderInfo() {
  return createVirtualElement("footer", { class: "info" }, "", [
    createVirtualElement("p", {}, "Double-click to edit a todo", []),
    createVirtualElement("p", {}, "", [
      createVirtualElement("span", {}, "Created by ", []),
      createVirtualElement("a", { href: "#" }, "AJA!", []),
    ]),
    createVirtualElement("p", {}, "", [
      createVirtualElement("span", {}, "Part of ", []),
      createVirtualElement("a", { href: "http://todomvc.com" }, "TodoMVC", []),
    ]),
  ]);
}

/**
 * Filters todos based on the current filter setting
 * @param {Array<Todo>} todos - Array of all todos
 * @param {string} filter - Current filter: "all", "active", or "completed"
 * @returns {Array<Todo>} Filtered array of todos
 */
function getFilteredTodos(todos, filter) {
  switch (filter) {
    case "active":
      return (todos || []).filter((todo) => !todo.completed);
    case "completed":
      return (todos || []).filter((todo) => todo.completed);
    default:
      return todos;
  }
}

/**
 * Business logic functions for todo operations
 */

/**
 * Adds a new todo to the list
 * @param {string} title - The todo title text
 * @returns {boolean} True if todo was added successfully, false otherwise
 */
function addTodo(title) {
  console.log("addTodo function");
  if (title.length < 2) {
    return false;
  }
  const currentState = app.getState();
  const newTodo = {
    id: currentState.nextId,
    title: title,
    completed: false,
  };

  app.setState({
    todos: [...currentState.todos, newTodo],
    nextId: currentState.nextId + 1,
  });
  return true;
}

/**
 * Toggles the completed status of a specific todo
 * @param {number} id - The ID of the todo to toggle
 */
function toggleTodo(id) {
  const state = app.getState();
  const updatedTodos = (state.todos || []).map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );

  app.setState({ todos: updatedTodos });
}

/**
 * Updates the title of an existing todo or deletes it if title is empty
 * @param {number} id - The ID of the todo to edit
 * @param {string} newTitle - The new title for the todo
 */
function editTodo(id, newTitle) {
  console.log("editTodo function");
  const trimmedTitle = newTitle.trim();

  if (trimmedTitle.length < 2) {
    return;
  }

  if (trimmedTitle === "") {
    deleteTodo(id);
    return;
  }

  const state = app.getState();
  const updatedTodos = (state.todos || []).map((todo) =>
    todo.id === id ? { ...todo, title: trimmedTitle } : todo
  );

  app.setState({
    todos: updatedTodos,
    editingId: null,
    focusEditTodo: null,
  });
}

/**
 * Removes a todo from the list
 * @param {number} id - The ID of the todo to delete
 */
function deleteTodo(id) {
  const state = app.getState();
  const updatedTodos = (state.todos || []).filter((todo) => todo.id !== id);
  app.setState({ todos: updatedTodos });
}

/**
 * Enters edit mode for a specific todo
 * @param {number} id - The ID of the todo to start editing
 */
function startEditing(id) {
  app.setState({
    editingId: id,
    focusEditTodo: id,
  });

  // Focus the edit input after the DOM updates and position cursor at end
  setTimeout(() => {
    focusElement(".edit", "end");
  }, 0);
}

/**
 * Toggles the completed status of all todos
 * If all todos are completed, marks them all as incomplete
 * If any todos are incomplete, marks them all as complete
 */
function toggleAll() {
  const state = app.getState();
  const allCompleted =
    (state.todos || []).length > 0 &&
    (state.todos || []).every((todo) => todo.completed);
  const updatedTodos = (state.todos || []).map((todo) => ({
    ...todo,
    completed: !allCompleted,
  }));

  app.setState({ todos: updatedTodos });
}

/**
 * Removes all completed todos from the list
 */
function clearCompleted() {
  const state = app.getState();
  const activeTodos = (state.todos || []).filter((todo) => !todo.completed);
  app.setState({ todos: activeTodos });
}

/**
 * Initialize and start the application
 * Sets the render function and initializes the app with routing
 */

app.setRenderFunction(renderApp);

app.init();
