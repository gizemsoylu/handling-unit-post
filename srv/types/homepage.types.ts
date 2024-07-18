export interface IHandlingUnits {
    NodeID: number
    HierarchyLevel: number;
    ParentNodeID?: number | null;
    DrillState: string;
    HUNumber: string;
    SubHUNumber?: string;
    HUStatus: string;
    HUType?: string;
    MaterialNumber?: string;
    PackagingMaterial?: string;
    PackagingMaterialType?: string;
    ProductionOrder?: string;
    QuantityPerHU?: number | null;
    QuantityAvailability?: string;
    EWMStorageBin?: string;
    EWMStorageType?: string;
    EWMWarehouse?: string;
    SubEWMWarehouse?: string;
    EWMHUProcessStepIsCompleted?: boolean;
    EWMDimensionUnit?: string;
    CreationDate?: Date | null;
}

export interface IHandlingUnitsArray extends Array<IHandlingUnits> {
    $count?: number;
}

export interface IHandlingUnitItems {
    AvailableEWMStockQty: any;
    EWMStorageBin: any;
    EWMStorageType: any;
    HUNumber: string;
    SubHUNumber: string;
    HandlingUnitNumber_1: string;
    HandlingUnitNumber: string;
    QuantityAvailability: string;
    QuantityPerHU: number | null;
    QuantityPerHu: number | null;
    HUType: string;
    HandlingUnitType: string;
    HUStatus: string;
    HandlingUnitStatus: string;
    SubEWMWarehouse: string;
    EWMWarehouse_1: string;
    NodeID: number
    HierarchyLevel: number;
    ParentNodeID?: number | null;
    DrillState: string;
    CreationDate: Date | null;
    CreationDateTime: Date | null;
    EWMWarehouse: string;
}

export interface IStorageBins {
    EWMWarehouse: string;
    EWMStorageBin: string;
    EWMStorageType: string;
}

export interface IMoveStorageBins {
    WarehouseProcessType: string;
    SourceHandlingUnit: string;
    EWMWarehouse: string;
    DestinationStorageType: string;
    DestinationStorageBin: string;
}

export interface IWhereClause {
    ref: string[];
    val: number | string | Date | null;
}

export interface IOrderByClause {
    [x: string]: any;
    ref: string[];
    sort: 'asc' | 'desc';
}

