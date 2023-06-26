/*
 * Copyright 2023 SpinalCom - www.spinalcom.com
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

import type { IProjectionOffset } from '../../interfaces';
import {
  type Val,
  FileSystem,
  Model,
  spinalCore,
} from 'spinal-core-connectorjs';

export class ProjectionOffsetModel extends Model {
  r: Val;
  t: Val;
  z: Val;

  constructor(offset: IProjectionOffset) {
    super();
    if (FileSystem._sig_server === false) return;
    this.add_attr('r', offset.r);
    this.add_attr('t', offset.t);
    this.add_attr('z', offset.z);
  }
  update(offset: IProjectionOffset): void {
    this.r.set(offset.r);
    this.t.set(offset.t);
    this.z.set(offset.z);
  }
}
spinalCore.register_models(ProjectionOffsetModel);
