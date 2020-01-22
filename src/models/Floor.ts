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
