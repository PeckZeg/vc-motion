<template>
  key 3 is a different component with others.

  <!-- Input field -->
  <div>
    <label>
      node count
      <input type="number" :value="state.count" @input="onCountChange" />
    </label>

    <button type="button" @click="onFlushMotion">Flush Motion</button>
  </div>

  <!-- Motion State -->
  <div>
    <label v-for="key in state.count" :key="key">
      <input
        type="checkbox"
        :checked="state.checkedMap[key] !== false"
        @input="onChange(key, state.checkedMap[key] !== false)"
      />
      {{ key }}
    </label>
  </div>

  <!-- Motion List -->
  <CSSMotionList
    :keys="state.keyList"
    motion-name="transition"
    @appear-start="onCollapse"
    @enter-start="onCollapse"
    @leave-active="onCollapse"
    @visible-changed="onVisibleChanged"
  >
    <template v-slot="{ key, background, ...props }">
      <div v-bind="props" class="demo-block" :style="{ background }">
        <span>{{ key }}</span>
      </div>
    </template>
  </CSSMotionList>
</template>

<script lang="ts">
import { CSSMotionList } from '../src';
import { VueKey } from '@ayase/vc-util/lib/types';

import { defineComponent } from 'vue';

interface DemoState {
  count: number;
  checkedMap: Record<string, boolean>;
  keyList: VueKey[];
}

export default defineComponent<{}, {}, { state: DemoState }>({
  components: {
    CSSMotionList
  },

  data() {
    return {
      state: {
        count: 1,
        checkedMap: {},
        keyList: []
      }
    };
  },

  mounted() {
    this.onFlushMotion();
  },

  methods: {
    onCountChange({ target: { value } }) {
      this.state.count = Number(value);
    },

    onFlushMotion() {
      const { count, checkedMap } = this.state;
      let keyList = [];

      console.log(checkedMap);

      for (let i = 0; i < count; i += 1) {
        if (checkedMap[i] !== false) {
          keyList.push(i);
        }
      }

      keyList = keyList.map((key) => {
        if (key === 3) {
          return { key, background: 'orange' };
        }

        return key;
      });

      this.state.keyList = keyList;
    },

    // Motion
    onCollapse() {
      return { width: 0, margin: '0 -5px 0 0' };
    },

    onVisibleChanged(changedVisible, info) {
      console.log('Visible Changed >>>', changedVisible, info);
    },

    onChange(key, checked) {
      this.state.checkedMap[key] = !checked;
    }
  }
});
</script>

<style lang="less" src="./CSSMotionList.less"></style>
