import { type SpinalGraph, SpinalNode } from 'spinal-model-graph';
import GuiViewer3D = Autodesk.Viewing.GuiViewer3D;
import Viewer3D = Autodesk.Viewing.Viewer3D;
import type { IGetArchi } from '../../interfaces/IGetArchi';
export declare function getArchi(graph: SpinalGraph, configName: string, bimFile: SpinalNode, viewer: GuiViewer3D | Viewer3D): Promise<IGetArchi>;
