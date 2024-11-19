using HandlingUnitPost as service from '../../../srv/data-provider';

annotate service.HandlingUnits {
    @Common.ValueListWithFixedValues: true
    HandlingUnitStatus        @Common.ValueList: {
        $Type         : 'Common.ValueListType',
        CollectionPath: 'VHStatus',
        SearchSupported,
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: HandlingUnitStatus,
            ValueListProperty: 'HandlingUnitStatus'
        }]
    };

    EWMWarehouse    @Common.ValueList: {
        $Type         : 'Common.ValueListType',
        CollectionPath: 'VHWarehouses',
        SearchSupported,
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: EWMWarehouse,
            ValueListProperty: 'EWMWarehouse'
        }]
    };

    HandlingUnitNumber        @Common.ValueList: {
        $Type         : 'Common.ValueListType',
        CollectionPath: 'VHHUNumbers',
        SearchSupported,
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: HandlingUnitNumber,
            ValueListProperty: 'HandlingUnitNumber'
        }]
    };

    Product         @Common.ValueList: {
        $Type         : 'Common.ValueListType',
        CollectionPath: 'VHProducts',
        SearchSupported,
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: Product,
            ValueListProperty: 'Product'
        }]
    };
    EWMStorageBin   @Common.ValueList: {
        $Type         : 'Common.ValueListType',
        CollectionPath: 'VHStorageBins',
        SearchSupported,
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: EWMStorageBin,
            ValueListProperty: 'EWMStorageBin'
        }]
    };
    EWMStorageType  @Common.ValueList: {
        $Type         : 'Common.ValueListType',
        CollectionPath: 'VHStorageTypes',
        SearchSupported,
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: EWMStorageType,
            ValueListProperty: 'EWMStorageType'
        }]
    };

    ProductionOrder @Common.ValueList: {
        $Type         : 'Common.ValueListType',
        CollectionPath: 'VHOrders',
        SearchSupported,
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: ProductionOrder,
            ValueListProperty: 'ProductionOrder'
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