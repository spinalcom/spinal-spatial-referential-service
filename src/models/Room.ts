import { Model } from 'spinal-core-connectorjs_type'

export class Room extends Model {
  //identification props
  public name: string;
  public externalId: string;
  public dbId: number;

  //other props
  public number?: number;
  public local?: string;
  public floor?: number;
  public area?: number;
  public perimeter?: number;
  public volume?: number;

  [key: string]: any;

  constructor(props) {
    super();
    this.add_attr({
      name: props.name,
      externalId: props.externalId,
      dbId: props.dbId,
      number: this.getPropertyNamed(props.properties, 'number'),
      local: this.getPropertyNamed(props.properties, 'local'),
      floors: this.getPropertyNamed(props.properties, 'etage'),
      area: this.getPropertyNamed(props.properties, 'area'),
      perimeter: this.getPropertyNamed(props.properties, 'perimeter'),
      volume: this.getPropertyNamed(props.properties, 'volume')
    })
  }

  getPropertyNamed(props, name) {
    for (let i = 0; i < props.length; i++) {
      if (props[i].attributeName.toLowerCase() === name)
        return props[i].displayValue;
    }
    return undefined;
  }

}
