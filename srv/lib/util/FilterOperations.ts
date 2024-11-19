import { IHandlingUnitsArray, IOrderByClause, IWhereClause } from "../../types/homepage.types";

export default class FilterOperations {
    private static globalParentNodeID: string | null = null;

    public static setGlobalParentNodeID(value: string | null): void {
        this.globalParentNodeID = value;
    }

    public static getGlobalParentNodeID(): string | null {
        return this.globalParentNodeID;
    }

    public sortNodes(nodeList: IHandlingUnitsArray, orderBy: IOrderByClause[]): IHandlingUnitsArray {
        const sortedNodes = [...nodeList];
        orderBy.reverse().forEach(order => {
            const property = order.ref[0];
            const sortOrder = order.sort;
            sortedNodes.sort(this.dynamicSort(property, sortOrder));
        });
        return sortedNodes;
    }
    
    public removeFilters(whereArray: (string | IWhereClause)[], keysToRemove: string[]): (string | IWhereClause)[] {
        const cleanedWhere: (string | IWhereClause)[] = []; 
    
        for (let i = 0; i < whereArray.length; i++) {
            const current = whereArray[i];
    
            if (
                typeof current === "object" &&
                current.ref &&
                current.ref[0] === "ParentNodeID" &&
                whereArray[i + 2] && 
                typeof whereArray[i + 2] === "object" &&
                (whereArray[i + 2] as IWhereClause).hasOwnProperty('val')
            ) {
                const val = (whereArray[i + 2] as IWhereClause).val;
                if (val) {
                    FilterOperations.setGlobalParentNodeID(val as string); 
                }
            }
    
            if (
                typeof current === "object" &&
                current.ref &&
                keysToRemove.includes(current.ref[0])
            ) {
                i += 2; 
    
                if (whereArray[i + 1] === "and" || whereArray[i + 1] === "or") {
                    i += 1; 
                }
            } else {
                cleanedWhere.push(current);
            }
        }
    
        return cleanedWhere;
    }
    
    private dynamicSort(property: string, order: string) {
        const sortOrder = order === 'desc' ? -1 : 1;
        return function (a: any, b: any) {
            const aValue = a[property];
            const bValue = b[property];

            if (aValue < bValue) {
                return -1 * sortOrder;
            }
            if (aValue > bValue) {
                return 1 * sortOrder;
            }
            return 0;
        };
    }
}