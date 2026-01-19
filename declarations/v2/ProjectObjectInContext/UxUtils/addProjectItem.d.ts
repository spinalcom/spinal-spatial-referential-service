import type { AuProps } from '../../interfaces/AuProps';
import type { TProjectionLst } from '../../interfaces/TProjectionLst';
export declare function addProjectItem(list: TProjectionLst, prop: AuProps, stopAtLeaf: boolean, aproximateByLevel: boolean): Promise<void>;
