
import Filter from "sap/ui/model/Filter";
import BaseController from "com/ndbs/handlingunitpostui/controller/BaseController";
import { Model$RequestFailedEvent as RequestFailedEvent } from "sap/ui/model/Model";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";


export enum ApplicationModels {
    DEFAULT_ODATA = "",
}

export enum DefaultMessages {
    NO_I18N_TEXT = "The message could not be displayed due to technical issues. Contact the administrator."
}
export interface IBindingParams {
    filters: Filter[]
}
export interface IPage {
    onODataRequestFail(event: RequestFailedEvent): void;
    onObjectMatched(event?: Route$PatternMatchedEvent): void;
}

export type PageController = IPage & BaseController;

export enum Routes {
    HOMEPAGE = "RouteHomepage",

}

export enum ApplicationGroups {
    HOMEPAGE = "Homepage",
}

export interface IStorageBins {
    EWMWarehouse: string;
    EWMStorageBin: string;
    EWMStorageType: string;
}

export interface IMoveHUtoBin {
    EWMWarehouse: string;
    SourceHandlingUnit: string;
    WarehouseProcessType: string;
    DestinationStorageType: string;
    DestinationStorageBin: string;
}

export interface IMoveHUBody {
    moveHUs: IMoveHUtoBin[];
}
