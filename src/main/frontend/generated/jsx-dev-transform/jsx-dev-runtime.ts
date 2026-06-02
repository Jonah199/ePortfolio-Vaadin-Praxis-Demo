import { JSXSource, Fragment as reactFragment, jsxDEV as reactJsxDEV } from 'react/jsx-dev-runtime';

export const Fragment = reactFragment;

export function jsxDEV(
  type: React.ElementType,
  props: unknown,
  key: React.Key | undefined,
  isStatic: boolean,
  source?: JSXSource,
  self?: unknown
): React.ReactElement {
  const realFreeze = Object.freeze;
  try {
    (Object as any).freeze = undefined; 

    const reactElement: any = reactJsxDEV(type, props, key, isStatic, source, self);
    if (source && !reactElement._source) {
      
      
      reactElement._debugInfo ??= [];
      reactElement._debugInfo.source = source;
    }
    realFreeze(reactElement);
    return reactElement;
  } finally {
    (Object as any).freeze = realFreeze;
  }
}
