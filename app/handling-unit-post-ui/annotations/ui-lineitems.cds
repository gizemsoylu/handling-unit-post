using HandlingUnitPost as service from '../../../srv/data-provider';

annotate service.HandlingUnits {
    NodeID         @sap.hierarchy.node.for       : 'NodeID';
    ParentNodeID   @sap.hierarchy.parent.node.for: 'NodeID';
    HierarchyLevel @sap.hierarchy.level.for      : 'NodeID';
    DrillState     @sap.hierarchy.drill.state.for: 'NodeID';
}


annotate service.HandlingUnits with @(UI: {
    SelectionFields: [
        EWMWarehouse,
        HUNumber,
        Product,
        EWMStorageBin,
        EWMStorageType,
        ProductionOrder,
        HUStatus
    ],

    LineItem       : [
        {
            $Type                : 'UI.DataField',
            Value                : HUNumber,
            ![@HTML5.CssDefaults]: {
                $Type: 'HTML5.CssDefaultsType',
                width: '12rem',
            },
        },
        {
            $Type                : 'UI.DataField',
            Value                : PackagingMaterial,
            ![@HTML5.CssDefaults]: {
                $Type: 'HTML5.CssDefaultsType',
                width: '10rem',
            },
        },
        {
            $Type                : 'UI.DataField',
            Value                : Product,
            ![@HTML5.CssDefaults]: {
                $Type: 'HTML5.CssDefaultsType',
                width: '12rem',
            },
        },
        {
            $Type                : 'UI.DataField',
            Value                : QuantityPerHU,
            ![@HTML5.CssDefaults]: {
                $Type: 'HTML5.CssDefaultsType',
                width: '6rem',
            },
        },
        {
            $Type                : 'UI.DataField',
            Value                : EWMStorageBin,
            ![@HTML5.CssDefaults]: {
                $Type: 'HTML5.CssDefaultsType',
                width: '6rem',
            },
        },
        {
            $Type                : 'UI.DataField',
            Value                : EWMStorageType,
            ![@HTML5.CssDefaults]: {
                $Type: 'HTML5.CssDefaultsType',
                width: '6rem',
            },
        },
        {
            $Type                : 'UI.DataField',
            Value                : CreationDate,
            ![@HTML5.CssDefaults]: {
                $Type: 'HTML5.CssDefaultsType',
                width: '6rem',
            },
        },
        {
            $Type                : 'UI.DataField',
            Value                : ProductionOrder,
            ![@HTML5.CssDefaults]: {
                $Type: 'HTML5.CssDefaultsType',
                width: '8rem',
            },
        }
    ],
});

annotate service.StorageBins with @(UI: {LineItem: [
    {
        $Type                : 'UI.DataField',
        Value                : EWMStorageBin,
        ![@HTML5.CssDefaults]: {
            $Type: 'HTML5.CssDefaultsType',
            width: '12rem',
        },
    },
    {
        $Type                : 'UI.DataField',
        Value                : EWMStorageType,
        ![@HTML5.CssDefaults]: {
            $Type: 'HTML5.CssDefaultsType',
            width: '12rem',
        },
    },
], });
