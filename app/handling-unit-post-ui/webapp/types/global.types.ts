import Filter from "sap/ui/model/Filter";

export enum ApplicationModels {
    DEFAULT_ODATA = "",
}

export interface IBindingParams {
    filters:Filter[]
}