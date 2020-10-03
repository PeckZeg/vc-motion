<template>
  <button type="button" @click="setVisible(true)">visible = true</button>
  <button type="button" @click="setVisible(false)">visible = false</button>

  <CSSMotion
    :visible="visible"
    motion-name="debug-transition"
    @enter-start="() => ({ maxHeight: 0 })"
    @enter-active="() => ({ maxHeight: '200px' })"
    @leave-start="() => ({ maxHeight: '200px' })"
    @leave-active="() => ({ maxHeight: 0 })"
  >
    <template v-slot="{ style, ...props }">
      <div
        v-bind="props"
        :style="{
          width: '200px',
          height: '200px',
          background: 'green',
          ...style
        }"
      >
        <div class="inner-block">Hover when closing</div>
      </div>
    </template>
  </CSSMotion>
</template>

<script>
import CSSMotion from '../src';

import { ref } from 'vue';

export default {
  components: {
    CSSMotion
  },

  setup() {
    const visible = ref(true);

    function setVisible(next) {
      visible.value = next;
    }

    return {
      visible,
      setVisible
    };
  }
};
</script>

<style lang="less" src="./TransitionInsideDebug.less"></style>
