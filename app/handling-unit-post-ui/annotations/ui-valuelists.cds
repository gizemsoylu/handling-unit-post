using HandlingUnitPost as service from '../../../srv/data-provider';

annotate service.HandlingUnits {
    @Common.ValueListWithFixedValues: true
    HUStatus @Common.ValueList: {
        $Type         : 'Common.ValueListType',
        CollectionPath: 'VHStatus',
        SearchSupported,
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: HUStatus,
            ValueListProperty: 'HUStatus'
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

    EWMWarehouse  @Common          : {FilterDefaultValue: '1200'}
}
