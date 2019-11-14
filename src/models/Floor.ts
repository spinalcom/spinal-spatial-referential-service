import { Model } from "spinal-core-connectorjs_type";

export class Floor extends Model {
  public displayName: string;
  public level: number; //what is the level of the floor
  public z_index: number; // z coordinate of the floor

  constructor(displayName: string, level: number, z_index: number) {
    super();
    this.add_attr({
      displayName: displayName,
      level: level,
      z_index: z_index
    });
  }


  getPropertyNamed(props, name) {
    for (let i = 0; i < props.length; i++) {
      if (props[i].attributeName.toLowerCase() === name)
        return props[i];
    }
    return undefined;
  }
}