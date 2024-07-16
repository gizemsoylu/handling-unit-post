using HandlingUnitPost as service from '../../../srv/data-provider';

annotate service.StorageBins with {
    EWMStorageBin  @Common: {
        Text           : EWMStorageType,
        TextArrangement: #TextLast
    };
};
