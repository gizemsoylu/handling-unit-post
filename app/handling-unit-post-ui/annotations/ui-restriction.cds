using HandlingUnitPost as service from '../../../srv/data-provider';

annotate service.HandlingUnits with @Capabilities: {FilterRestrictions: {
    $Type                       : 'Capabilities.FilterRestrictionsType',
    RequiresFilter              : true,

    FilterExpressionRestrictions: [{
        $Type             : 'Capabilities.FilterExpressionRestrictionType',
        Property          : EWMWarehouse,
        AllowedExpressions: 'SingleValue'
    }]
}};