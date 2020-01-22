/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
 * 
 * This file is part of SpinalCore.
 * 
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 * 
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 * 
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

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
