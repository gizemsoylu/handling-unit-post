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
                        isMatching = this.applyFilter(node, currentField, currentOperator, currentValue);
                    }
                }
            }
            return isMatching;
        });
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
                return node[field] != value;
            case 'contains':
                return typeof node[field] === 'string' && node[field].includes(value);
            case 'startsWith':
                return typeof node[field] === 'string' && node[field].startsWith(value);
            case 'endsWith':
                return typeof node[field] === 'string' && node[field].endsWith(value);
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