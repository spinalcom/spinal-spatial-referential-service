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

import { SpinalGraph, SpinalNode } from 'spinal-model-graph';
import { loadConfig } from '../scripts/loadConfig';
import { loadBimFile } from '../scripts/loadBimFile';
import GuiViewer3D = Autodesk.Viewing.GuiViewer3D;
import Viewer3D = Autodesk.Viewing.Viewer3D;
import createFctGetArchi from '../../createFctGetArchi';
import type { IGetArchi } from '../interfaces/IGetArchi';

export async function getArchi(
  graph: SpinalGraph,
  configName: string,
  bimFile: SpinalNode,
  viewer: GuiViewer3D | Viewer3D
): Promise<IGetArchi> {
  // load config ny name
  const configModel = await loadConfig(graph);
  const config = configModel.getConfig(configName);
  // load BIMFILE
  const model = await loadBimFile(bimFile, viewer);
  // get Archi
  const fct = createFctGetArchi(config.get());
  const modelArchi: IGetArchi = await model
    .getPropertyDb()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    .executeUserFunction(fct);
  return modelArchi;
}
