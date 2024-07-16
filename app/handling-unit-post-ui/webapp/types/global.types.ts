import Filter from "sap/ui/model/Filter";

export enum ApplicationModels {
    DEFAULT_ODATA = "",
}

export enum DefaultMessages {
    NO_I18N_TEXT = "The message could not be displayed due to technical issues. Contact the administrator."
}

export interface IBindingParams {
    filters: Filter[]
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