type EventListener<T = any> = (data?: T) => void;
type EventListeners = Record<string, EventListener[]>;

export class Emitter<Events extends Record<string, any> = Record<string, any>> {
  private listeners: EventListeners = {};
  private maxListeners = 10;
  private autoCleanupTimer: NodeJS.Timeout | null = null;
  private readonly AUTO_CLEANUP_DELAY = 5000; // 5 seconds

  /**
   * Add a listener for an event
   */
  on<K extends string & keyof Events>(event: K, listener: EventListener<Events[K]>): this {
    // Cancel auto cleanup when new listener is added
    if (this.autoCleanupTimer) {
      clearTimeout(this.autoCleanupTimer);
      this.autoCleanupTimer = null;
    }

    if (!this.listeners[event as string]) {
      this.listeners[event as string] = [];
    }
    this.listeners[event as string].push(listener);

    // Warn if too many listeners
    if (this.listeners[event as string].length > this.maxListeners) {
      console.warn(
        `MaxListenerExceeded: ${this.listeners[event as string].length} listeners added for event "${String(event)}"`,
      );
    }

    return this;
  }

  /**
   * Add a one-time listener for an event
   */
  once<K extends string & keyof Events>(event: K, listener: EventListener<Events[K]>): this {
    const onceWrapper = (data?: Events[K]) => {
      listener(data);
      this.off(event, onceWrapper as EventListener);
    };

    return this.on(event, onceWrapper as EventListener<Events[K]>);
  }

  /**
   * Remove a listener for an event
   */
  off<K extends string & keyof Events>(event: K, listener: EventListener<Events[K]>): this {
    const eventListeners = this.listeners[event as string];

    if (eventListeners) {
      const index = eventListeners.indexOf(listener as EventListener);
      if (index !== -1) {
        eventListeners.splice(index, 1);
      }
    }

    // Auto cleanup if no listeners left
    this.scheduleAutoCleanup();

    return this;
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners<K extends string & keyof Events>(event?: K): this {
    if (event) {
      delete this.listeners[event as string];
    } else {
      this.listeners = {};
    }

    // Auto cleanup if no listeners left
    this.scheduleAutoCleanup();

    return this;
  }

  /**
   * Emit an event with data
   */
  emit<K extends string & keyof Events>(event: K, data?: Events[K]): boolean {
    const eventListeners = this.listeners[event as string];

    if (!eventListeners || eventListeners.length === 0) {
      return false;
    }

    eventListeners.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in listener for event "${String(event)}":`, error);
      }
    });

    return true;
  }

  /**
   * Get the number of listeners for an event
   */
  listenerCount<K extends string & keyof Events>(event: K): number {
    const eventListeners = this.listeners[event as string];
    return eventListeners ? eventListeners.length : 0;
  }

  /**
   * Get total number of listeners
   */
  private getTotalListenerCount(): number {
    return Object.values(this.listeners).reduce((sum, listeners) => sum + listeners.length, 0);
  }

  /**
   * Get all event names
   */
  eventNames(): (string | keyof Events)[] {
    return Object.keys(this.listeners);
  }

  /**
   * Set the maximum number of listeners
   */
  setMaxListeners(n: number): this {
    this.maxListeners = n;
    return this;
  }

  /**
   * Get the maximum number of listeners
   */
  getMaxListeners(): number {
    return this.maxListeners;
  }

  /**
   * Schedule auto cleanup if no listeners left
   */
  private scheduleAutoCleanup(): void {
    if (this.getTotalListenerCount() === 0) {
      if (this.autoCleanupTimer) clearTimeout(this.autoCleanupTimer);

      this.autoCleanupTimer = setTimeout(() => {
        this.destroy();
      }, this.AUTO_CLEANUP_DELAY);
    }
  }

  /**
   * Clear all listeners and free memory
   */
  destroy(): void {
    if (this.autoCleanupTimer) {
      clearTimeout(this.autoCleanupTimer);
      this.autoCleanupTimer = null;
    }
    this.listeners = {};
  }
}
