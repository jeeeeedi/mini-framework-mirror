/**
 * @fileoverview Mini-framework core application module
 * @version 1.0.0
 * @author AJA!
 */

// Import and re-export all framework components
import { globalStorage } from "./state.js";
import { updateDom } from "./dom.js";
import { addRoute, executeRoute } from "./route.js";

/** @constant {string} Framework version */
const VERSION = "1.0.0";

/**
 * Core application class that manages the entire application lifecycle
 * @class App
 */
class App {
  /**
   * Creates a new App instance
   * @param {string} [rootSelector] - CSS selector for the root element
   */
  constructor(rootSelector) {
    /** @type {Element|null} Root DOM element */
    this.rootElement = null;
    /** @type {string} CSS selector for root element */
    this.rootSelector = rootSelector;
    /** @type {Function|null} Main render function */
    this.renderFunction = null;
    /** @type {boolean} Initialization state flag */
    this.isInitialized = false;
  }

  /**
   * Sets the main render function for the application
   * @param {Function} renderFn - Function that returns virtual DOM elements
   * @returns {App} Returns this App instance for method chaining
   * @throws {Error} Throws if renderFn is not a function
   */
  setRenderFunction(renderFn) {
    if (typeof renderFn !== "function") {
      throw new Error("Render function must be a function");
    }
    this.renderFunction = renderFn;
    // Set up automatic re-rendering
    globalStorage.setUpdateCallback(() => this.render());
    return this;
  }

  /**
   * Adds a route to the application router
   * @param {string} path - Route path pattern
   * @param {Function} handler - Route handler function
   * @returns {App} Returns this App instance for method chaining
   */
  addRoute(path, handler) {
    addRoute(path, handler);
    return this;
  }

  /**
   * Initializes the application by setting up DOM, routes, and event listeners
   * @returns {App} Returns this App instance for method chaining
   * @throws {Error} Throws if root element is not found
   */
  init() {
    if (this.isInitialized) {
      console.warn("App already initialized");
      return this;
    }

    // Find root element
    this.rootElement = document.querySelector(this.rootSelector);
    if (!this.rootElement) {
      throw new Error(
        `Root element with selector "${this.rootSelector}" not found`
      );
    }

    // Set up hash change listener
    window.addEventListener("hashchange", () => {
      executeRoute(window.location.hash);
    });

    // Execute initial route
    executeRoute(window.location.hash || "#/");

    this.isInitialized = true;
    console.log(`App initialized (v${VERSION})`);

    // Initial render
    this.render();
    return this;
  }

  /**
   * Renders the application by executing the render function and updating the DOM
   * @throws {Error} Throws if no render function is set or app is not initialized
   */
  render() {
    if (!this.renderFunction) {
      throw new Error("No render function set. Use setRenderFunction() first.");
    }
    if (!this.rootElement) {
      throw new Error("App not initialized. Call init() first.");
    }

    const vdom = this.renderFunction();
    updateDom(this.rootElement, Array.isArray(vdom) ? vdom : [vdom]);
  }

  /**
   * Gets the current application state
   * @returns {Object} Current state object from global storage
   */
  getState() {
    return globalStorage.getState();
  }

  /**
   * Updates the application state
   * @param {Object} newState - New state object or partial state to merge
   * @param {boolean} [triggerUpdate=true] - Whether to trigger a re-render
   * @returns {Object} Updated state object
   */
  setState(newState, triggerUpdate = true) {
    return globalStorage.setState(newState, triggerUpdate);
  }
}

/**
 * Factory function for creating new App instances
 * @param {string} [rootSelector] - CSS selector for the root element
 * @returns {App} New App instance
 * @example
 * const app = createApp('#my-app');
 * app.setRenderFunction(() => ({ tag: 'div', text: 'Hello World' }));
 * app.init();
 */
export function createApp(rootSelector) {
  return new App(rootSelector);
}

export { App };
