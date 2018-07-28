import { EventEmitter } from "events";
import { fromEvent } from "rxjs";
import uuid from "uuid";

class SessionManager extends EventEmitter {
  id = uuid();
  subscriptions = [];

  subscribeToEvent(emitter, eventName, ...handlers) {
    return this.subscribeTo(this.eventsFrom(emitter, eventName), ...handlers);
  }

  eventsFrom(emitter, eventName) {
    return fromEvent(emitter, eventName, (event, payload) => ({
      event,
      ...payload
    }));
  }

  subscribeTo(observable, ...handlers) {
    const subscription = observable.subscribe(...handlers);

    this.subscriptions.push(subscription);

    return subscription;
  }

  dispose() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];
  }
}

export default SessionManager;
