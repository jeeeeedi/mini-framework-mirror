/**
 * @fileoverview State management system for the mini-framework
 * @version 1.0.0
 * @author AJA!
 */

/** @type {Map<string, Function>} Global route storage mapping URLs to handler functions */
export var allRoutes = new Map()

/**
 * State management class with listener support and automatic updates
 * @class State
 */
export class State {
    /**
     * Creates a new State instance
     * @param {Array<Function>} [listeners] - Optional array of listener functions to call on state changes
     */
    constructor(listeners) {
        /** @type {Object} Internal state storage */
        this.state = {}
        /** @type {Array<Function>} Array of listener functions */
        this.listeners = []
        /** @type {Function|null} Callback function for triggering updates */
        this.updateCallback = null // Add this
        if (listeners && Array.isArray(listeners) && listeners.length > 0) {
            for (const listener of listeners) {
                if (typeof listener !== "function") {
                    return false
                } else {
                    this.listeners.push(listener) // Fix: was assigning instead of pushing
                }
            }
        }
        return true
    }

    /**
     * Sets the update callback function that gets called on state changes
     * @param {Function} callback - Function to call when state is updated
     */
    setUpdateCallback(callback) {
        this.updateCallback = callback;
    }

    /**
     * Returns the current state object
     * @returns {Object} Current state object
     */
    getState() {
        return this.state
    }

    /**
     * Updates the state with new values
     * @param {Object} newVal - Object containing new state values to merge
     * @param {boolean} [triggerUpdate=true] - Whether to trigger listeners and update callbacks
     * @returns {boolean} True if state was updated successfully, false if newVal is invalid
     */
    setState(newVal, triggerUpdate = true) {
        if (typeof newVal !== "object" || newVal === null) {
            return false // Ensure newVal is an object
        }
        this.state = { ...this.state, ...newVal } // Add more robust check
        if (triggerUpdate) {
            this.update()
            // Trigger DOM re-render
            if (this.updateCallback) {
                this.updateCallback()
            }
        }
        return true
    }

    /**
     * Executes all registered listener functions
     * @private
     */
    update() {
        for (const listener of this.listeners) { // Fix: iterate over listeners correctly
            listener()
        }
    }
}

/** @type {State} Global state instance used throughout the framework */
export const globalStorage = new State()
