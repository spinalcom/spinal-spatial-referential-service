import type { AuProps } from '../../interfaces';

export function getCategory(props: AuProps) {
  for (const prop of props.properties) {
    if (
      prop.attributeName === 'Category' &&
      prop.displayCategory === '__category__'
    ) {
      return prop;
    }
  }
}
