<template>
  <label>
    <input type="checkbox" :checked="state.show" @change="onTrigger" />
    Show Component
  </label>

  <label>
    <input v-model="state.hasMotionClass" type="checkbox" />
    hasMotionClass
  </label>

  <label>
    <input v-model="state.forceRender" type="checkbox" />
    forceRender
  </label>

  <label>
    <input v-model="state.removeOnLeave" type="checkbox" />
    removeOnLeave {{ state.removeOnLeave ? '' : ' (use leavedClassName)' }}
  </label>

  <label>
    <input v-model="state.prepare" type="checkbox" />
    prepare before motion
  </label>

  <div class="grid">
    <div>
      <h2>With Transition Class</h2>
      <CSSMotion
        :visible="state.show"
        :force-render="state.forceRender"
        :motion-name="state.hasMotionClass ? 'transition' : null"
        :remove-on-leave="state.removeOnLeave"
        leaved-class="hidden"
        @appear-prepare="state.prepare && forceDelay"
        @enter-prepare="state.prepare && forceDelay"
        @appear-start="onCollapse"
        @enter-start="onCollapse"
        @leave-active="onCollapse"
        @enter-end="skipColorTransition"
        @leave-end="skipColorTransition"
        @visible-changed="onVisibleChanged"
      >
        <template v-slot="props">
          <Div v-bind="props" class="demo-block" />
        </template>
      </CSSMotion>
    </div>

    <div>
      <h2>With Animation Class</h2>

      <CSSMotion
        :visible="state.show"
        :force-render="state.forceRender"
        :motion-name="state.hasMotionClass ? 'animation' : null"
        :remove-on-leave="state.removeOnLeave"
        leaved-class="hidden"
        @leave-active="styleGreen"
      >
        <template v-slot="props">
          <div v-bind="props" class="demo-block" />
        </template>
      </CSSMotion>
    </div>
  </div>

  <div>
    <button type="button" @click="onMotionLeaveImmediately">
      motionLeaveImmediately
    </button>

    <div>
      <CSSMotion
        v-if="state.motionLeaveImmediately"
        :visible="false"
        :motion-name="state.hasMotionClass ? 'transition' : null"
        :remove-on-leave="state.removeOnLeave"
        leaved-class="hidden"
        motion-leave-immediately
        @leave-active="onCollapse"
        @leave-end="skipColorTransition"
      >
        <template v-slot="props">
          <div v-bind="props" class="demo-block" />
        </template>
      </CSSMotion>
    </div>
  </div>
</template>

<script lang="ts">
import CSSMotion from '../src';

import { onMounted, onBeforeUnmount, defineComponent, nextTick } from 'vue';

interface DemoState {
  show: boolean;
  forceRender: boolean;
  motionLeaveImmediately: boolean;
  removeOnLeave: boolean;
  hasMotionClass: boolean;
  prepare: boolean;
}

const Div = defineComponent({
  setup() {
    onMounted(() => {
      console.log('DIV >>> Mounted!');
    });

    onBeforeUnmount(() => {
      console.log('DIV >>> UnMounted!');
    });
  },

  render() {
    return <div {...this.$attrs} v-slots={this.$slots} />;
  }
});

export default defineComponent<{}, {}, { state: DemoState }>({
  components: { CSSMotion, Div },

  data() {
    return {
      state: {
        show: true,
        forceRender: false,
        motionLeaveImmediately: false,
        removeOnLeave: true,
        hasMotionClass: true,
        prepare: false
      }
    };
  },

  methods: {
    onTrigger() {
      setTimeout(() => {
        this.state.show = !this.state.show;
      }, 100);
    },

    onCollapse() {
      return { height: '0px' };
    },

    skipColorTransition(_, event) {
      // CSSMotion support multiple transition.
      // You can return false to prevent motion end when fast transition finished.
      return event.propertyName !== 'background-color';
    },

    styleGreen() {
      return {
        background: 'green'
      };
    },

    async forceDelay(): Promise<void> {
      return new Promise((resolve) => {
        setTimeout(resolve, 2000);
      });
    },

    onVisibleChanged(visible) {
      console.log('Visible Changed:', visible);
    },

    onMotionLeaveImmediately() {
      this.state.motionLeaveImmediately = !this.state.motionLeaveImmediately;
    }
  }
});
</script>

<style lang="less" src="./CSSMotion.less"></style>
