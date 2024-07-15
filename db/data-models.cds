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
        MaterialNumber              : String;
        PackagingMaterial           : String;
        PackagingMaterialType       : String;
        ProductionOrder             : String;
        QuantityPerHU               : Integer;
        EWMStorageBin               : String;
        EWMStorageType              : String;
        EWMWarehouse                : String;
        EWMHUProcessStepIsCompleted : Boolean;
        EWMDimensionUnit            : String;
        CreationDate                : DateTime;
}

@cds.persistence.skip
entity StorageBins {
    key EWMWarehouse   : String;
    key EWMStorageBin  : String;
        EWMStorageType : String;
};
