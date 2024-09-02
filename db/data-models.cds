@cds.persistence.skip
entity HandlingUnits {
    key NodeID                      : Integer;
    key HUNumber                    : String;
        SubHUNumber                 : String;
        HierarchyLevel              : Integer;
        ParentNodeID                : Integer;
        DrillState                  : String;
        HUStatus                    : String;
        HUType                      : String;
        Product                     : String;
        PackagingMaterial           : String;
        PackagingMaterialType       : String;
        ProductionOrder             : String;
        QuantityPerHU               : Integer;
        QuantityAvailability        : String;
        EWMStorageBin               : String;
        EWMStorageType              : String;
        EWMWarehouse                : String;
        EWMHUProcessStepIsCompleted : Boolean;
        EWMDimensionUnit            : String;
        CreationDate                : Date;
}

@cds.persistence.skip
entity StorageBins {
    key EWMWarehouse   : String;
    key EWMStorageBin  : String;
        EWMStorageType : String;
};

type moveHU {
    EWMWarehouse           : String;
    SourceHandlingUnit     : String;
    WarehouseProcessType   : String;
    DestinationStorageType : String;
    DestinationStorageBin  : String
}
