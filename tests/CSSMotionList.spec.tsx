import { VueKey } from '@ayase/vc-util/lib/types';

import { genCSSMotionList } from '../src/CSSMotionList';
import { genCSSMotion } from '../src/CSSMotion';
import { defineComponent, nextTick } from 'vue';
import { arrayOf, string } from 'vue-types';
import { mount } from '@vue/test-utils';

describe('CSSMotionList', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('diff should work', () => {
    async function testMotion(
      CSSMotionList: any,
      injectLeave?: (wrapper: any) => void | Promise<void>
    ) {
      let leaveCalled = 0;

      function onLeaveEnd() {
        leaveCalled += 1;
      }

      const Demo = defineComponent({
        props: {
          keys: arrayOf(string()).def(() => ['a', 'b'])
        },

        render() {
          return (
            <CSSMotionList
              motionName="transition"
              keys={this.$props.keys}
              onLeaveEnd={onLeaveEnd}
              v-slots={{
                default: (props) => (
                  <div class="motion-box" data-test="CSSMotion" {...props}>
                    {props.key}
                  </div>
                )
              }}
            />
          );
        }
      });

      const wrapper = mount(Demo);

      function checkKeys(targetKeys: VueKey[]) {
        const nodeList = wrapper.findAll('.motion-box');
        const keys = nodeList.map((node) => node.text());
        expect(keys).toEqual(targetKeys);
      }

      checkKeys(['a', 'b']);

      // Change to ['c', 'd']
      jest.runAllTimers();
      await wrapper.vm.$nextTick();

      await wrapper.setProps({ keys: ['c', 'd'] });

      jest.runAllTimers();
      await wrapper.vm.$nextTick();

      // Inject leave event
      if (injectLeave) {
        await Promise.resolve(injectLeave(wrapper));
      }

      await wrapper.vm.$nextTick();
      jest.runAllTimers();
      await wrapper.vm.$nextTick();
      checkKeys(['c', 'd']);

      if (injectLeave) {
        expect(leaveCalled).toEqual(2);
      }
    }

    it('with motion support', () => {
      const CSSMotion = genCSSMotion(true);
      const CSSMotionList = genCSSMotionList(true, CSSMotion);

      return testMotion(CSSMotionList, async (wrapper) => {
        const motionList = wrapper.findAll('[data-test="CSSMotion"]');

        for (const cssMotion of motionList.slice(0, 2)) {
          jest.runAllTimers();
          await wrapper.vm.$nextTick();

          const transitionEndEvent = new Event('transitionend');
          cssMotion.element.dispatchEvent(transitionEndEvent);
        }
      });
    });

    it('without motion support', () => {
      const CSSMotionList = genCSSMotionList(false);
      return testMotion(CSSMotionList);
    });
  });

  it('onVisibleChanged', async () => {
    const onVisibleChanged = jest.fn();
    const CSSMotionList = genCSSMotionList(false);

    const Demo = defineComponent({
      props: ['keys'],
      render() {
        return (
          <CSSMotionList
            motionName="transition"
            keys={this.$props.keys}
            onVisibleChanged={onVisibleChanged}
            v-slots={{
              default: (props) => (
                <div class="motion-box" {...props}>
                  {props.key}
                </div>
              )
            }}
          />
        );
      }
    });

    const wrapper = mount(Demo, { props: { keys: ['a'] } });

    jest.runAllTimers();
    await nextTick();
    expect(onVisibleChanged).toHaveBeenCalledWith(true, { key: 'a' });
    onVisibleChanged.mockReset();

    // Remove
    await wrapper.setProps({ keys: [] });
    jest.runAllTimers();
    await nextTick();
    expect(onVisibleChanged).toHaveBeenCalledWith(false, { key: 'a' });
  });
});
