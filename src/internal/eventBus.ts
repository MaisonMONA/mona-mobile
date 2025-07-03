import { reactive } from 'vue';

type EventCallback = (data?: any) => void;

interface EventBus {
  events: { [key: string]: EventCallback[] };
  on(event: string, callback: EventCallback): void;
  emit(event: string, data?: any): void;
  off(event: string, callback: EventCallback): void;
}

const eventBus = reactive<EventBus>({
  events: {},
  
  on(event: string, callback: EventCallback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  },
  
  emit(event: string, data?: any) {
    if (this.events[event]) {
      this.events[event].forEach((callback: EventCallback) => callback(data));
    }
  },
  
  off(event: string, callback: EventCallback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter((cb: EventCallback) => cb !== callback);
    }
  }
});

export { eventBus };