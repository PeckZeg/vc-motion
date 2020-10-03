import { UnwrapRef, Ref, onBeforeUnmount, ref } from 'vue';

export default function useMountStatus<T>(
  defaultValue?: T
): [Ref<UnwrapRef<T>>, (next: T) => void] {
  const destroyRef = ref(false);
  const val = ref(defaultValue);

  function setValue(next: T) {
    if (!destroyRef.value) {
      val.value = next as UnwrapRef<T>;
    }
  }

  onBeforeUnmount(() => {
    destroyRef.value = true;
  });

  return [val, setValue];
}
