import { IHandlingUnitsArray, IOrderByClause, IWhereClause } from "../../types/homepage.types";

export default class FilterOperations {

    public filterNodeList(nodeList: IHandlingUnitsArray, filters: (IWhereClause | string)[]): IHandlingUnitsArray {
        return nodeList.filter(node => {
            let currentField = '';
            let currentOperator = '';
            let currentValue: any = null;
            let isMatching = true;
        
            for (const filter of filters) {
                if (typeof filter === 'string') {
                    if (filter === 'and') {
                        if (!isMatching) return false;
                        isMatching = true;  
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
                    } else if (filter.hasOwnProperty('xpr')) {
                        isMatching = this.processXpr(node, filter.xpr);
                    } else if (filter.hasOwnProperty('func')) {
                        currentOperator = filter.func;
                        const args = filter.args;
                        
                        if (args && args.length > 0) {
                            currentField = args[0].ref[0];
                            currentValue = args.length > 1 ? args[1].val : null;
                        }
    
                        if (isMatching) {
                            isMatching = this.applyFilter(node, currentField, currentOperator, currentValue);
                        }
                    }
                }
            }
            return isMatching;
        });
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
            case 'does not contain':
                return typeof node[field] === 'string' && !node[field].includes(value);
            case 'startsWith':
                return typeof node[field] === 'string' && node[field].startsWith(value);
            case 'does not start with':
                return typeof node[field] === 'string' && !node[field].startsWith(value);
            case 'endsWith':
                return typeof node[field] === 'string' && node[field].endsWith(value);
            case 'does not end with':
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