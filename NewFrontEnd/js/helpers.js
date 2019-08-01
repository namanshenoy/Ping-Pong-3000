/* eslint-disable no-unused-vars */

class Observable {
  subscribe(init, name, onNext, onError, onComplete) {
    this.name = name
    this.internal = init
    // eslint-disable-next-line no-undef
    const subject = new Rx.Subject()
    this.sub = subject.subscribe(onNext, onError, onComplete)
  }

  set(val) {
    this.data = val
  }

  set data(val) {
    this.internal = val
    if (this.sub) {
      // eslint-disable-next-line no-console
      console.log(this.name)
      this.sub.next(val)
    }
  }

  get data() {
    return this.internal;
  }
}

const setEventListener = (el, type, cb) => {
  if (typeof el === 'string') {
    document.getElementById(el).addEventListener(type, cb)
  } else {
    el.addEventListener(cb)
  }
}
