import { ComponentPublicInstance, defineComponent } from 'vue';
import { genCSSMotion, CSSMotionProps } from '../src/CSSMotion';
import { mount } from '@vue/test-utils';
import { bool } from 'vue-types';

describe('CSSMotion', () => {
  const CSSMotion = genCSSMotion(true);

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('transition', () => {
    function onCollapse() {
      return { height: 0 };
    }

    function onExpand() {
      return { height: '100px' };
    }

    const actionList: {
      name: string;
      props: CSSMotionProps;
      visible: boolean[];
      oriHeight: string;
      tgtHeight: string;
    }[] = [
      {
        name: 'appear',
        props: {
          motionAppear: true,
          onAppearStart: onCollapse,
          onAppearActive: onExpand
        },
        visible: [true],
        oriHeight: '0px',
        tgtHeight: '100px'
      },
      {
        name: 'enter',
        props: {
          motionEnter: true,
          onEnterStart: onCollapse,
          onEnterActive: onExpand
        },
        visible: [false, true],
        oriHeight: '0px',
        tgtHeight: '100px'
      },
      {
        name: 'leave',
        props: {
          motionLeave: true,
          onLeaveStart: onExpand,
          onLeaveActive: onCollapse
        },
        visible: [true, false],
        oriHeight: '100px',
        tgtHeight: '0px'
      }
    ];

    actionList.forEach(({ name, props, visible, oriHeight, tgtHeight }) => {
      const Demo = defineComponent({
        props: {
          visible: { type: Boolean, default: visible[0] }
        },

        render() {
          const motionProps = Object.assign(
            {
              motionName: 'transition',
              motionAppear: false,
              motionEnter: false,
              motionLeave: false,
              visible: this.visible
            },
            props
          );

          return (
            <CSSMotion
              ref="CSSMotion"
              {...motionProps}
              v-slots={{
                default: (props) => (
                  <div id="CSSMotion" class="motion-box" {...props} />
                )
              }}
            />
          );
        }
      });

      it(name, async () => {
        const nextVisible = visible[1];
        const wrapper = mount(Demo);

        async function doStartTest() {
          wrapper.vm.$forceUpdate();
          await wrapper.vm.$nextTick();

          const boxNode = wrapper.find<HTMLDivElement>('.motion-box');

          expect(boxNode.classes()).toContain('transition');
          expect(boxNode.classes()).toContain(`transition-${name}`);
          expect(boxNode.classes()).not.toContain(`transition-${name}-active`);
          expect(boxNode.element.style.height).toEqual(oriHeight);

          // Motion active
          jest.runAllTimers();
          wrapper.vm.$forceUpdate();
          await wrapper.vm.$nextTick();

          const activeBoxNode = wrapper.find<HTMLDivElement>('.motion-box');
          expect(activeBoxNode.classes()).toContain('transition');
          expect(activeBoxNode.classes()).toContain(`transition-${name}`);
          expect(activeBoxNode.classes()).toContain(
            `transition-${name}-active`
          );
          expect(activeBoxNode.element.style.height).toEqual(tgtHeight);

          // Motion end
          const component = wrapper.findComponent<
            ComponentPublicInstance<{}, {}, {}, {}, { onMotionEnd: () => void }>
          >({ ref: 'CSSMotion' });

          // @ts-ignore
          await component.triggerMotionEvent();

          jest.runAllTimers();
          component.vm.$forceUpdate();
          await component.vm.$nextTick();

          if (nextVisible === false) {
            expect(wrapper.find('.motion-box').exists()).toBeFalsy();
          } else if (nextVisible !== undefined) {
            const finalBoxNode = wrapper.find<HTMLDivElement>('.motion-box');

            expect(finalBoxNode.classes()).not.toContain('transition');
            expect(finalBoxNode.classes()).not.toContain(`transition-${name}`);
            expect(finalBoxNode.classes()).not.toContain(
              `transition-${name}-active`
            );
            expect(Boolean(finalBoxNode.element.style.length)).toBeFalsy();
          }
        }

        // Delay for the visible finished
        if (nextVisible !== undefined) {
          await wrapper.setProps({ visible: nextVisible });
          return doStartTest();
        } else {
          return doStartTest();
        }
      });
    });

    it('stop transition if config motion to false', async () => {
      const wrapper = mount({
        render() {
          return (
            <CSSMotion
              motionName="transition"
              visible
              {...this.$attrs}
              v-slots={{
                default: (props) => <div class="motion-box" {...props} />
              }}
            />
          );
        }
      });

      wrapper.vm.$forceUpdate();
      await wrapper.vm.$nextTick();
      let boxNode = wrapper.find('.motion-box');
      expect(boxNode.classes()).toContain('transition');
      expect(boxNode.classes()).toContain('transition-appear');
      expect(boxNode.classes()).not.toContain('transition-appear-active');

      await wrapper.setProps({ motionAppear: false });
      jest.runAllTimers();
      wrapper.vm.$forceUpdate();
      await wrapper.vm.$nextTick();

      boxNode = wrapper.find('.motion-box');
      expect(boxNode.classes()).not.toContain('transition');
      expect(boxNode.classes()).not.toContain('transition-appear');
      expect(boxNode.classes()).not.toContain('transition-appear-active');
    });

    it('quick switch should have correct status', async () => {
      const wrapper = mount({
        render() {
          return (
            <CSSMotion
              motionName="transition"
              {...this.$attrs}
              v-slots={{
                default: (props) => <div class="motion-box" {...props} />
              }}
            />
          );
        }
      });

      await wrapper.setProps({ visible: true });
      jest.runAllTimers();

      await wrapper.setProps({ visible: false });
      jest.runAllTimers();

      const boxNode = wrapper.find('.motion-box');
      expect(boxNode.classes()).toContain('transition');
      expect(boxNode.classes()).toContain('transition-leave');
      expect(boxNode.classes()).toContain('transition-leave-active');

      wrapper.unmount();
    });
  });

  describe('immediately', () => {
    it('motionLeaveImmediately', async () => {
      const wrapper = mount(() => (
        <CSSMotion
          motionName="transition"
          motionLeaveImmediately
          visible={false}
          v-slots={{
            default: (props) => <div class="motion-box" {...props} />
          }}
        />
      ));

      wrapper.vm.$forceUpdate();
      await wrapper.vm.$nextTick();

      const boxNode = wrapper.find('.motion-box');
      expect(boxNode.classes()).toContain('transition');
      expect(boxNode.classes()).toContain('transition-leave');
      expect(boxNode.classes()).not.toContain('transition-leave-active');

      jest.runAllTimers();
      wrapper.vm.$forceUpdate();
      await wrapper.vm.$nextTick();

      const activeBoxNode = wrapper.find('.motion-box');
      expect(boxNode.classes()).toContain('transition');
      expect(boxNode.classes()).toContain('transition-leave');
      expect(boxNode.classes()).toContain('transition-leave-active');
    });
  });

  it('no transition', () => {
    const NoCSSTransition = genCSSMotion(false);

    const wrapper = mount(() => (
      <NoCSSTransition
        motionName="transition"
        v-slots={{
          default: (props) => <div class="motion-box" {...props} />
        }}
      />
    ));

    const boxNode = wrapper.find('.motion-box');
    expect(boxNode.classes()).not.toContain('transition');
    expect(boxNode.classes()).not.toContain('transition-appear');
    expect(boxNode.classes()).not.toContain('transition-appear-active');
  });

  it("onMotionEnd shouldn't be fired by inner element", async () => {
    const onLeaveEnd = jest.fn();
    const wrapper = mount({
      props: {
        visible: bool().def(true)
      },

      render() {
        return (
          <CSSMotion
            {...Object.assign(
              {
                motionName: 'bamboo',
                onLeaveEnd,
                removeOnLeave: false
              },
              this.$props
            )}
            v-slots={{
              default: ({ ref }) => (
                <div ref={ref} id="CSSMotion" class="outer-block">
                  <div class="inner-block" />
                </div>
              )
            }}
          />
        );
      }
    });

    async function resetLeave() {
      await wrapper.setProps({ visible: true });
      jest.runAllTimers();
      await wrapper.vm.$nextTick();

      await wrapper.setProps({ visible: false });
      jest.runAllTimers();
      await wrapper.vm.$nextTick();
    }

    await resetLeave();
    // @ts-ignore
    await wrapper.triggerMotionEvent();
    expect(onLeaveEnd).toHaveBeenCalledTimes(1);

    await resetLeave();
    // @ts-ignore
    await wrapper.triggerMotionEvent(wrapper.find('.outer-block'));
    expect(onLeaveEnd).toHaveBeenCalledTimes(2);

    await resetLeave();
    // @ts-ignore
    await wrapper.triggerMotionEvent(wrapper.find('.inner-block'));
    expect(onLeaveEnd).toHaveBeenCalledTimes(2);
  });
});
