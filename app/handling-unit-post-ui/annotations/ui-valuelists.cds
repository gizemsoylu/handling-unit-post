using HandlingUnitPost as service from '../../../srv/data-provider';

annotate service.HandlingUnits {
    @Common.ValueListWithFixedValues: true
    HUStatus             @Common.ValueList: {
        $Type         : 'Common.ValueListType',
        CollectionPath: 'VHStatus',
        SearchSupported,
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: HUStatus,
            ValueListProperty: 'HUStatus'
        }]
    };

    EWMWarehouse         @Common.ValueList: {
        $Type         : 'Common.ValueListType',
        CollectionPath: 'VHWarehouses',
        SearchSupported,
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: EWMWarehouse,
            ValueListProperty: 'EWMWarehouse'
        }]
    };

    HUNumber             @Common.ValueList: {
        $Type         : 'Common.ValueListType',
        CollectionPath: 'VHHUNumbers',
        SearchSupported,
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: HUNumber,
            ValueListProperty: 'HUNumber'
        }]
    };

    MaterialNumber       @Common.ValueList: {
        $Type         : 'Common.ValueListType',
        CollectionPath: 'VHMaterials',
        SearchSupported,
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: MaterialNumber,
            ValueListProperty: 'MaterialNumber'
        }]
    };
    EWMStorageBin        @Common.ValueList: {
        $Type         : 'Common.ValueListType',
        CollectionPath: 'VHStorageBins',
        SearchSupported,
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: EWMStorageBin,
            ValueListProperty: 'EWMStorageBin'
        }]
    };
    EWMStorageType       @Common.ValueList: {
        $Type         : 'Common.ValueListType',
        CollectionPath: 'VHStorageTypes',
        SearchSupported,
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: EWMStorageType,
            ValueListProperty: 'EWMStorageType'
        }]
    };

    ProductionOrder      @Common.ValueList: {
        $Type         : 'Common.ValueListType',
        CollectionPath: 'VHOrders',
        SearchSupported,
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: ProductionOrder,
            ValueListProperty: 'ProductionOrder'
        }]
    };

    @Common.FilterDefaultValue      : 'Yes'
    @Common.ValueListWithFixedValues: true
    QuantityAvailability @Common.ValueList: {
        $Type         : 'Common.ValueListType',
        CollectionPath: 'VHAvailabilityQuantity',
        SearchSupported,
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: QuantityAvailability,
            ValueListProperty: 'QuantityAvailability'
        }]
    };
}

annotate service.StorageBins {
    EWMStorageBin @Common.ValueList: {
        $Type         : 'Common.ValueListType',
        CollectionPath: 'StorageBins',
        SearchSupported,
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: EWMStorageBin,
                ValueListProperty: 'EWMStorageBin',
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'EWMStorageType',
            },
        ]
    };
}
