import type { ICmdNew } from '../interfaces';
import { type ITreeItem } from './ITreeItem';
export declare function mergeBimGeoCreateCmd(treeItems: ITreeItem[]): Promise<ICmdNew[][]>;
