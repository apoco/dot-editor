import { EventEmitter } from "events";
import { fromEvent, Observable, Subscription } from "rxjs";
import { v4 as uuid } from "uuid";
import { FromEventTarget } from "rxjs/internal/observable/fromEvent";

class SessionManager extends EventEmitter {
  id = uuid();
  subscriptions: Array<Subscription> = [];

  subscribeToEvent<T>(
    emitter: EventEmitter,
    eventName: string,
    next?: (value: T) => void,
    nextError?: (err: Error) => void,
    complete?: () => void
  ) {
    return this.subscribeTo(
      this.eventsFrom(emitter, eventName),
      next,
      nextError,
      complete
    );
  }

  eventsFrom<T>(emitter: FromEventTarget<T>, eventName: string) {
    return fromEvent(emitter, eventName, (event, payload) => ({
      event,
      ...payload
    }));
  }

  subscribeTo<T>(
    observable: Observable<T>,
    next?: (value: T) => void,
    nextError?: (err: Error) => void,
    complete?: () => void
  ) {
    const subscription = observable.subscribe(next, nextError, complete);

    this.subscriptions.push(subscription);

    return subscription;
  }

  dispose() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];
  }
}

export default SessionManager;
