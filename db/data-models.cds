entity HandlingUnits {
    key ExternalID          : String;
        HierarchyLevel      : Integer;
        ParentNodeID        : Integer;
        DrillState          : String;
        Material            : String;
        ProductOrder        : String;
        PackagingMaterial   : String;
        Plant               : String;
        StorageLocation     : String;
        StorageLocationName : String;
        Quantity            : Integer;
        QuantityUnit        : String;
        Reference           : String;
        ReferenceDocType    : String;
        Status              : String;
        StatusName          : String;
}

entity StorageLocations {
    key StorageLocation     : String;
        StorageLocationName : String;
        Plant               : String;
}
