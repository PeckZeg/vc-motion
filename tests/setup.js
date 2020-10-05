const { VueWrapper } = require('@vue/test-utils');

window.requestAnimationFrame = (func) => {
  window.setTimeout(func, 16);
};

Object.assign(VueWrapper.prototype, {
  async triggerMotionEvent(target) {
    const motionEvent = new Event('transitionend');

    if (target) {
      Object.defineProperty(motionEvent, 'target', {
        get: () => target.element
      });
    }

    jest.runAllTimers();
    this.vm.$forceUpdate();
    await this.vm.$nextTick();
    this.find('#CSSMotion').element.dispatchEvent(motionEvent);
  }
});
