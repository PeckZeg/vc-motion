import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DomWrapper',

  render() {
    return this.$slots.default();
  }
});
