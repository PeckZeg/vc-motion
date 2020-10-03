import { DerivedStateFromPropsMixin } from '@ayase/vc-util/lib/mixins';
import { VueKey } from '@ayase/vc-util/lib/types';
import { Fragment, defineComponent } from 'vue';

import OriginCSSMotion, {
  CSSMotionProps,
  getCSSMotionPropTypes
} from './CSSMotion';

import {
  STATUS_REMOVED,
  STATUS_REMOVE,
  STATUS_KEEP,
  STATUS_ADD,
  parseKeys,
  KeyObject,
  diffKeys
} from './util/diff';

import { arrayOf, object, oneOf, oneOfType, shape, string } from 'vue-types';
import { vueKeyType } from '@ayase/vc-util/lib/vueTypes';
import { supportTransition } from './util/motion';

export interface CSSMotionListProps
  extends Omit<CSSMotionProps, 'onVisibleChanged'> {
  keys: (VueKey | { key: VueKey; [name: string]: any })[];
  component?: string | object | false;

  /** This will always trigger after final visible changed. Even if no motion configured. */
  onVisibleChanged?: (visible: boolean, info: { key: VueKey }) => void;
}

export interface CSSMotionListState {
  keyEntities: KeyObject[];
}

/**
 * Generate a CSSMotionList component with config
 * @param transitionSupport No need since CSSMotionList no longer depends on transition support
 * @param CSSMotion CSSMotion component
 */
export function genCSSMotionList(
  transitionSupport: boolean,
  CSSMotion = OriginCSSMotion
) {
  return defineComponent<CSSMotionListProps, {}, { state: CSSMotionListState }>(
    {
      name: 'CSSMotionList',
      mixins: [DerivedStateFromPropsMixin],

      props: {
        ...getCSSMotionPropTypes(),

        keys: arrayOf(
          oneOfType([
            vueKeyType(),
            shape({ key: vueKeyType().isRequired }).loose
          ])
        ),

        component: oneOfType([string(), object(), oneOf([false])]).def('div')
      } as undefined,

      data() {
        return {
          state: {
            keyEntities: []
          }
        };
      },

      getDerivedStateFromProps(
        { keys }: CSSMotionListProps,
        { keyEntities }: CSSMotionListState
      ) {
        const parsedKeyObjects = parseKeys(keys);
        const mixedKeyEntities = diffKeys(keyEntities, parsedKeyObjects);

        return {
          keyEntities: mixedKeyEntities.filter((entity) => {
            const prevEntity = keyEntities.find(
              ({ key }) => entity.key === key
            );

            // Remove if already mark as removed
            return !(
              prevEntity &&
              prevEntity.status === STATUS_REMOVED &&
              entity.status === STATUS_REMOVE
            );
          })
        };
      },

      methods: {
        removeKey(removeKey: VueKey) {
          this.state.keyEntities = this.state.keyEntities.map((entity) => {
            if (entity.key !== removeKey) return entity;

            return {
              ...entity,
              status: STATUS_REMOVED
            };
          });
        }
      },

      render() {
        const {
          keys,
          component,
          onVisibleChanged,
          ...motionProps
        }: CSSMotionListProps = this.$props;

        const Component = component || Fragment;
        const { keyEntities }: CSSMotionListState = this.state;

        return (
          // @ts-ignore
          <Component {...{ ...this.$attrs }}>
            {keyEntities.map(({ status, ...eventProps }) => {
              const visible = status === STATUS_ADD || status === STATUS_KEEP;

              return (
                <CSSMotion
                  {...motionProps}
                  key={eventProps.key}
                  visible={visible}
                  eventProps={eventProps}
                  onVisibleChanged={(changedVisible) => {
                    onVisibleChanged?.(changedVisible, { key: eventProps.key });

                    if (!changedVisible) {
                      this.removeKey(eventProps.key);
                    }
                  }}
                  v-slots={this.$slots}
                />
              );
            })}
          </Component>
        );
      }
    }
  );
}

export default genCSSMotionList(supportTransition);
