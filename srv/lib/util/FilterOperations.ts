import { IHandlingUnitsArray, IOrderByClause, IWhereClause } from "../../types/homepage.types";

export default class FilterOperations {
    public filterNodeList(nodeList: IHandlingUnitsArray, filters: (IWhereClause | string)[], huPallets: IHandlingUnitsArray, parentNodeMap: Map<string, { nodeId: number; subNodes: string[]; }>): IHandlingUnitsArray {

        const hasParentNodeID = filters.some(filter =>
            this.isIWhereClause(filter) && filter.ref && filter.ref[0] === 'ParentNodeID'
        );
        
        if (hasParentNodeID) {
            const parentNodeFilterIndex = filters.findIndex(filter => 
                this.isIWhereClause(filter) && filter.ref && filter.ref[0] === 'ParentNodeID'
            );
        
            if (parentNodeFilterIndex !== -1) {
                const parentNodeCondition = filters.slice(parentNodeFilterIndex, parentNodeFilterIndex + 3);
                filters = parentNodeCondition;
            }
        }

        let skipNext = false;
        filters = filters.reduce((acc, filter, index) => {
            if (skipNext) {
                if (this.isIWhereClause(filter) && filter.hasOwnProperty('val')) {
                    skipNext = false;
                }
                return acc;
            }

            if (this.isIWhereClause(filter) && filter.hasOwnProperty('ref') && Array.isArray(filter.ref) && filter.ref[0] === 'HierarchyLevel') {
                const nextFilter = filters[index + 2];
                if (nextFilter && this.isIWhereClause(nextFilter) && nextFilter.hasOwnProperty('val') && nextFilter.val === 0) {
                    skipNext = true;
                    return acc;
                }
            }

            if (this.isIWhereClause(filter) && filter.hasOwnProperty('ref') && Array.isArray(filter.ref) && filter.ref[0] === 'HUNumber') {
                skipNext = true;
                return acc;
            }

            if (
                index > 0 &&
                typeof filters[index - 1] === 'string' &&
                ['and', 'or', '='].includes(filters[index - 1] as string)
            ) {
                if (this.isIWhereClause(filters[index]) && filters[index].hasOwnProperty('ref') && filters[index].ref[0] === 'HUNumber') {
                    skipNext = true;
                    acc.pop();
                    return acc;
                }
            }

            if (this.isIWhereClause(filter) && filter.hasOwnProperty('xpr')) {
                if (index > 0 && typeof filters[index - 1] === 'string' && ['and', 'or'].includes(filters[index - 1] as string)) {
                    acc.pop();
                }
                return acc;
            }

            return [...acc, filter];
        }, [] as (IWhereClause | string)[]);

        let filteredNodes = nodeList.filter(node => {
            let currentField = '';
            let currentOperator = '';
            let currentValue: any = null;
            let isMatching = true;

            for (const filter of filters) {
                if (typeof filter === 'string') {
                    if (filter === 'and') {
                        if (!isMatching) return false;
                        isMatching = true;
                    } else if (filter === 'or') {
                        if (isMatching) return true;
                        isMatching = false;
                    } else {
                        currentOperator = filter;
                    }
                } else {
                    if (filter.hasOwnProperty('ref')) {
                        currentField = filter.ref[0];
                    }

                    if (filter.hasOwnProperty('val')) {
                        currentValue = filter.val;
                        if (isMatching) {
                            isMatching = this.applyFilter(node, currentField, currentOperator, currentValue);
                        }
                    } else if (filter.hasOwnProperty('func')) {
                        const funcName = filter.func;
                        const args = filter.args;
                        const field = args[0].ref[0];
                        const value = args[1].val;
                        isMatching = this.applyFilter(node, field, funcName, value);
                    } else if (filter.hasOwnProperty('xpr')) {
                        isMatching = this.processXpr(node, filter.xpr);
                    }

                    if (!isMatching) {
                        break;
                    }
                }
            }
            return isMatching;
        });

        if (!filteredNodes.length) {
            let HUNumber: string | null | number | Date = null;

            filters.forEach((filter, index) => {
                if (this.isIWhereClause(filter) && Array.isArray(filter.ref) && filter.ref[0] === 'HUNumber') {
                    const nextFilter = filters[index + 2];
                    if (nextFilter && typeof nextFilter === 'object' && 'val' in nextFilter) {
                        HUNumber = nextFilter?.val;
                    }
                }
            });

            if (HUNumber) {
                filteredNodes = nodeList.filter(node => node.HUNumber === HUNumber);

                if (filteredNodes.length) {
                    const parentNodeID = filteredNodes[0].ParentNodeID;
                    const parentNodes = nodeList.filter(node => node.NodeID === parentNodeID && node.HandlingUnitNumber_1.replace(/^0+/, '') === HUNumber);

                    filteredNodes = [...parentNodes];
                }
            }

            if (HUNumber && !filteredNodes.length) {
                let parentNode = huPallets.filter(node => node.SubHUNumber === HUNumber);

                if (parentNode.length) {
                    const parentSubNodes = parentNodeMap.get(parentNode[0].HUNumber)?.subNodes;

                    if (parentSubNodes && parentSubNodes.includes(HUNumber)) {
                        const matchingNode = nodeList.find(node =>
                            parentSubNodes.includes(node.HandlingUnitNumber_1.replace(/^0+/, ''))
                        );

                        matchingNode ? filteredNodes.push(matchingNode) : []
                    }
                }
            }
        }

        const hasParentNodeIDFilter = filters.some(filter =>
            this.isIWhereClause(filter) && filter.ref && filter.ref[0] === 'ParentNodeID'
        );
        
        if (hasParentNodeIDFilter) {
            console.log(`Returning ${filteredNodes.length} nodes directly (ParentNodeID filter applied)`);
            return filteredNodes;
        }
        
        const parentNodes: IHandlingUnitsArray = [];
        const uniqueParentIds = new Set<number>(); 
        
        for (const node of filteredNodes) {
            if (node.ParentNodeID) {
                const parentNode = nodeList.find(parent => parent.NodeID === node.ParentNodeID);
                if (parentNode && !uniqueParentIds.has(parentNode.NodeID)) {
                    parentNodes.push(parentNode);
                    uniqueParentIds.add(parentNode.NodeID);
                }
            } else {
                parentNodes.push(node);
                uniqueParentIds.add(node.NodeID);
            }
        }
        
        console.log(`Returning ${parentNodes.length} parent nodes`);
        return parentNodes;
    }

    private isIWhereClause(filter: any): filter is IWhereClause {
        return (
            typeof filter === 'object' &&
            filter !== null &&
            (
                (filter.hasOwnProperty('ref') && Array.isArray(filter.ref)) ||
                filter.hasOwnProperty('xpr') ||
                filter.hasOwnProperty('func') || filter.hasOwnProperty('val')
            )
        );
    }


    private processXpr(node: any, xpr: any[]): boolean {
        let isMatching = false;
        let currentField = '';
        let currentOperator = '';
        let currentValue: any = null;

        for (let i = 0; i < xpr.length; i++) {
            const part = xpr[i];

            if (typeof part === 'string') {
                if (part === 'or') {
                    if (isMatching) return true;
                } else if (part === 'and') {
                    if (!isMatching) return false;
                } else {
                    currentOperator = part;
                }
            } else if (part.hasOwnProperty('ref')) {
                currentField = part.ref[0];
            } else if (part.hasOwnProperty('val')) {
                currentValue = part.val;
                isMatching = this.applyFilter(node, currentField, currentOperator, currentValue);
            } else if (part.hasOwnProperty('xpr')) {
                isMatching = this.processXpr(node, part.xpr);
            }

            if (!isMatching) {
                break;
            }
        }

        return isMatching;
    }

    private applyFilter(node: any, field: string, operator: string, value: any): boolean {
        switch (operator) {
            case '=':
                return node[field] == value;
            case '<':
                return node[field] < value;
            case '<=':
                return node[field] <= value;
            case '>':
                return node[field] > value;
            case '>=':
                return node[field] >= value;
            case '!=':
            case 'not equal to':
                return node[field] != value;
            case 'contains':
                return typeof node[field] === 'string' && node[field].includes(value);
            case 'not contains':
                return typeof node[field] === 'string' && !node[field].includes(value);
            case 'startswith':
                return typeof node[field] === 'string' && node[field].startsWith(value);
            case 'not startswith':
                return typeof node[field] === 'string' && !node[field].startsWith(value);
            case 'endswith':
                return typeof node[field] === 'string' && node[field].endsWith(value);
            case 'not endswith':
                return typeof node[field] === 'string' && !node[field].endsWith(value);
            case 'empty':
                return node[field] === null || node[field] === undefined || node[field] === '';
            case 'not empty':
                return node[field] !== null && node[field] !== undefined && node[field] !== '';
            case 'between':
                return Array.isArray(value) && node[field] >= value[0] && node[field] <= value[1];
            case 'not between':
                return Array.isArray(value) && (node[field] < value[0] || node[field] > value[1]);
            default:
                return true;
        }
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