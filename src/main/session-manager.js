import { EventEmitter } from "events";
import { fromEvent } from "rxjs";
import uuid from "uuid";

class SessionManager extends EventEmitter {
  id = uuid();
  subscriptions = [];

  subscribeToEvent(emitter, event, ...handlers) {
    return this.subscribeTo(fromEvent(emitter, event), ...handlers);
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
