using HandlingUnitPost as service from '../../../srv/data-provider';

annotate service.HandlingUnits {
    @Common.ValueListWithFixedValues: true
    HUStatus          @Common.ValueList: {
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
