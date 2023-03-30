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
import type { SpinalNode } from 'spinal-model-graph';
import Model = Autodesk.Viewing.Model;
import GuiViewer3D = Autodesk.Viewing.GuiViewer3D;
import Viewer3D = Autodesk.Viewing.Viewer3D;

interface ISVF {
  version: number;
  path: string;
  id: string;
  name: string;
  thumbnail: string;
  aecPath: string;
}

function loadModel(
  viewer: GuiViewer3D | Viewer3D,
  path: string,
  option = {}
): Promise<Model> {
  return new Promise<Model>((resolve, reject) => {
    let m = undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fn: (event: any) => void = (e: any) => {
      if (m && e.model.id === m.id) {
        viewer.removeEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, fn);
        resolve(m);
      }
    };
    viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, fn);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fct: any = viewer.loadModel;
    if (!viewer.started) fct = viewer.start;
    fct.call(
      viewer,
      path,
      option,
      (model: Model) => {
        m = model;
      },
      reject
    );
  });
}

export async function loadBimFile(
  bimFile: SpinalNode,
  viewer: GuiViewer3D | Viewer3D
) {
  const bimFileId = bimFile.info.id.get();
  const svfVersionFile: ISVF = await window.spinal.SpinalForgeViewer.getSVF(
    bimFile.element,
    bimFileId,
    bimFile.info.name.get()
  );
  const path = window.location.origin + svfVersionFile.path;
  const m = await loadModel(viewer, path, {});
  window.spinal.BimObjectService.addModel(
    bimFileId,
    m,
    svfVersionFile.version,
    null,
    bimFile.info.name.get()
  );
  return m;
}
