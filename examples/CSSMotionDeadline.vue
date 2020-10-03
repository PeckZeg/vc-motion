<template>
  <label>
    <input v-model="state.show" type="checkbox" />
    Show Component
  </label>

  <div class="grid">
    <div>
      <h2>With Transition Class</h2>

      <CSSMotion
        :visible="state.show"
        :motion-deadline="1000"
        motion-name="trigger"
        remove-on-leave
        @appear-start="onStart"
        @enter-start="onStart"
        @leave-start="onStart"
        @appear-end="onEnd"
        @enter-end="onEnd"
        @leave-end="onEnd"
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
import { defineComponent } from 'vue';

interface DemoState {
  show: boolean;
}

export default defineComponent<{}, {}, { state: DemoState }>({
  components: {
    CSSMotion
  },

  data() {
    return {
      state: {
        show: true
      }
    };
  },

  methods: {
    onStart(ele: HTMLElement, event: object) {
      console.log('start!', ele, event);
    },

    onEnd(ele: HTMLElement, event: object) {
      console.log('end!', ele, event);
    }
  }
});
</script>

<style lang="less" src="./CSSMotion.less"></style>
