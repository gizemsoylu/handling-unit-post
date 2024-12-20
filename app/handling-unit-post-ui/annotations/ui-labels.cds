using HandlingUnitPost as service from '../../../srv/data-provider';

annotate service.HandlingUnits with {
    NodeID                      @Common.Label: '{i18n>NodeID}';
    HandlingUnitNumber                    @Common.Label: '{i18n>HandlingUnitNumber}';
    HandlingUnitNumber_1                 @Common.Label: '{i18n>HandlingUnitNumber_1}';
    HierarchyLevel              @Common.Label: '{i18n>HierarchyLevel}';
    ParentNodeID                @Common.Label: '{i18n>ParentNodeID}';
    DrillState                  @Common.Label: '{i18n>DrillState}';
    HandlingUnitStatus                    @Common.Label: '{i18n>HandlingUnitStatus}';
    HUType                      @Common.Label: '{i18n>HUType}';
    Product                     @Common.Label: '{i18n>Product}';
    PackagingMaterial           @Common.Label: '{i18n>PackagingMaterial}';
    PackagingMaterialType       @Common.Label: '{i18n>PackagingMaterialType}';
    ProductionOrder             @Common.Label: '{i18n>ProductionOrder}';
    QuantityPerHU               @Common.Label: '{i18n>QuantityPerHU}';
    QuantityAvailability        @Common.Label: '{i18n>QuantityAvailability}';
    EWMStorageBin               @Common.Label: '{i18n>EWMStorageBin}';
    EWMStorageType              @Common.Label: '{i18n>EWMStorageType}';
    EWMWarehouse                @Common.Label: '{i18n>EWMWarehouse}';
    EWMHUProcessStepIsCompleted @Common.Label: '{i18n>EWMHUProcessStepIsCompleted}';
    EWMDimensionUnit            @Common.Label: '{i18n>EWMDimensionUnit}';
    CreationDate                @Common.Label: '{i18n>CreationDate}';
}

annotate service.StorageBins with {
    EWMWarehouse   @Common.Label: '{i18n>EWMWarehouse}';
    EWMStorageBin  @Common.Label: '{i18n>EWMStorageBin}';
    EWMStorageType @Common.Label: '{i18n>EWMStorageType}';
}
