/// <reference types="forge-viewer" />
import type { SpinalNode } from 'spinal-model-graph';
import Model = Autodesk.Viewing.Model;
import GuiViewer3D = Autodesk.Viewing.GuiViewer3D;
import Viewer3D = Autodesk.Viewing.Viewer3D;
export declare function loadBimFile(bimFile: SpinalNode, viewer: GuiViewer3D | Viewer3D): Promise<Model>;
