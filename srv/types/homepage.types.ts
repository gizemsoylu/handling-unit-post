export interface IHandlingUnits {
    EWMStockQuantityInBaseUnit_1: any;
    MaterialNumber?: string;
    Product?: string;
    NodeID: number
    HierarchyLevel: number;
    ParentNodeID?: number | null;
    DrillState: string;
    HUNumber: string;
    SubHUNumber?: string;
    HUStatus: string;
    HUType?: string;
    PackagingMaterial?: string;
    PackagingMaterialType?: string;
    ProductionOrder?: string;
    QuantityPerHU: number;
    QuantityAvailability?: string;
    EWMStorageBin: string;
    EWMStorageType: string;
    EWMWarehouse?: string;
    SubEWMWarehouse?: string;
    EWMHUProcessStepIsCompleted?: boolean;
    EWMDimensionUnit?: string;
    CreationDate?: Date | null;
    AvailableEWMStockQty: number;
}

export interface IHandlingUnitsArray extends Array<IHandlingUnits> {
    $count?: number;
}

export interface IHandlingUnitItems {
    YY1_PlannedMaterial_HUH: string | undefined;
    MaterialNumber?: string | undefined;
    ProductionOrder: string;
    HandlingUnitIndicator: string;
    Product: string;
    EWMStockQuantityInBaseUnit_1: number;
    HandlingUnitBottomInd: any;
    HandlingUnitTopLevelInd: any;
    EWMStorageBin_1: string;
    EWMStorageType_1: string;
    PackagingMaterialType: string;
    EWMStockQuantityInBaseUnit: number;
    AvailableEWMStockQty: number;
    EWMStorageBin: string;
    EWMStorageType: string;
    HUNumber: string;
    SubHUNumber: string;
    HandlingUnitNumber_1: string;
    HandlingUnitNumber: string;
    QuantityAvailability: string;
    QuantityPerHU: number;
    QuantityPerHu: number;
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

export interface IMoveHUBody {
    moveHUs: IMoveStorageBins[]
}
export interface IWhereClause {
    xpr: (string | IWhereClause)[];
    args: any;
    func: string;
    ref: string[];
    val: number | string | Date | null;
}

export interface IOrderByClause {
    [x: string]: any;
    ref: string[];
    sort: 'asc' | 'desc';
}

