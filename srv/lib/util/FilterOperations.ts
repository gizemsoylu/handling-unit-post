import { IHandlingUnitsArray, IOrderByClause, IWhereClause } from "../../types/homepage.types";

export default class FilterOperations {
    private static globalParentNodeID: string | null = null;
    
    public static setGlobalParentNodeID(value: string | null): void {
        this.globalParentNodeID = value;
    }
    
    public static getGlobalParentNodeID(): string | null {
        return this.globalParentNodeID;
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

    public buildExtendedWhereClause(cleanedWhereClause: (string | IWhereClause)[]): (string | IWhereClause)[] {
        return cleanedWhereClause?.reduce<(string | IWhereClause)[]>((acc, item, index, array) => {
            if (typeof item === "object" && item.xpr) {
                let skipXprIndexes = 0;
    
                const processXpr = (xprArray: (string | IWhereClause)[]): (string | IWhereClause)[] => {
                    return xprArray.reduce<(string | IWhereClause)[]>((xprAcc, xprItem, xprIndex, xprArrayInner) => {
                        if (skipXprIndexes > 0) {
                            skipXprIndexes--;
                            return xprAcc;
                        }
    
                        if (typeof xprItem === "object" && Array.isArray(xprItem.xpr) && xprItem.xpr ) {
                            xprAcc.push({
                                xpr: processXpr(xprItem.xpr) 
                            });
                            return xprAcc;
                        }
    
                        if (typeof xprItem === "object" && xprItem.ref?.[0] === "HandlingUnitNumber") {
                            const nextXprItem = xprArrayInner[xprIndex + 2];
                            if (nextXprItem && typeof nextXprItem === "object" && nextXprItem.val) {
                                const handlingUnitValue = String(nextXprItem.val).padStart(20, "0");
    
                                xprAcc.push({
                                    xpr: [
                                        { ref: ["HandlingUnitNumber"] }, "=", { val: handlingUnitValue },
                                        "or",
                                        { ref: ["HandlingUnitNumber_1"] }, "=", { val: handlingUnitValue }
                                    ]
                                } as IWhereClause);
    
                                skipXprIndexes = 2;
                                return xprAcc;
                            }
                        }
    
                        if (typeof xprItem === "object" && xprItem.ref?.[0] === "HandlingUnitStatus") {
                            const nextXprItem = xprArrayInner[xprIndex + 2];
                            if (nextXprItem && typeof nextXprItem === "object" && nextXprItem.val) {
                                if (nextXprItem.val === "Received") {
                                    xprAcc.push({
                                        xpr: [
                                            { ref: ["AvailableEWMStockQty"] },
                                            ">",
                                            { val: 0 }
                                        ]
                                    } as IWhereClause);
                                } else if (nextXprItem.val === "Planned") {
                                    xprAcc.push({
                                        xpr: [
                                            { ref: ["AvailableEWMStockQty"] },
                                            "=",
                                            { val: null }
                                        ]
                                    } as IWhereClause);
    
                                    xprAcc.push("and");
    
                                    xprAcc.push({
                                        xpr: [
                                            { ref: ["HandlingUnitNumber_1"] },
                                            "!=",
                                            { val: "" }
                                        ]
                                    } as IWhereClause);
                                }
    
                                skipXprIndexes = 2;
                                return xprAcc;
                            }
                        }
    
                        xprAcc.push(xprItem);
                        return xprAcc;
                    }, []);
                };
    
                const modifiedXpr = processXpr(item.xpr);
    
                acc.push({ ...item, xpr: modifiedXpr });
                return acc;
            }
    
            if (typeof item === "object" && item.ref?.[0] === "HandlingUnitStatus") {
                const nextItem = array[index + 2];
                if (nextItem && typeof nextItem === "object" && nextItem.val) {
                    if (nextItem.val === "Received") {
                        acc.push({
                            xpr: [
                                { ref: ["AvailableEWMStockQty"] },
                                ">",
                                { val: 0 }
                            ]
                        } as IWhereClause);
                    } else if (nextItem.val === "Planned") {
                        acc.push({
                            xpr: [
                                { ref: ["AvailableEWMStockQty"] },
                                "=",
                                { val: null }
                            ]
                        } as IWhereClause);
    
                        acc.push("and");
    
                        acc.push({
                            xpr: [
                                { ref: ["HandlingUnitNumber_1"] },
                                "!=",
                                { val: "" }
                            ]
                        } as IWhereClause);
                    }
                    return acc;
                }
            }

            const previousItem = array[index - 1];
            const twoItemsBefore = array[index - 2];
    
            if (
                (typeof previousItem === "object" && previousItem.ref?.[0] === "HandlingUnitNumber") ||
                (typeof twoItemsBefore === "object" && twoItemsBefore.ref?.[0] === "HandlingUnitNumber")
            ) {
                return acc;
            }
    
            if (
                (typeof previousItem === "object" && previousItem.ref?.[0] === "HandlingUnitStatus") ||
                (typeof twoItemsBefore === "object" && twoItemsBefore.ref?.[0] === "HandlingUnitStatus")
            ) {
                return acc;
            }
    
            acc.push(item);
            return acc;
        }, []);
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