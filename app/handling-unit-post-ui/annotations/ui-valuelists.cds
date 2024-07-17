using HandlingUnitPost as service from '../../../srv/data-provider';

annotate service.HandlingUnits {
    @Common.ValueListWithFixedValues: true
    HUStatus        @Common.ValueList: {
        $Type         : 'Common.ValueListType',
        CollectionPath: 'VHStatus',
        SearchSupported,
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: HUStatus,
            ValueListProperty: 'HUStatus'
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

    HUNumber        @Common.ValueList: {
        $Type         : 'Common.ValueListType',
        CollectionPath: 'VHHUNumbers',
        SearchSupported,
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: HUNumber,
            ValueListProperty: 'HUNumber'
        }]
    };

    MaterialNumber  @Common.ValueList: {
        $Type         : 'Common.ValueListType',
        CollectionPath: 'VHMaterials',
        SearchSupported,
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: MaterialNumber,
            ValueListProperty: 'MaterialNumber'
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
