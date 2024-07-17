import { IHandlingUnitsArray, IWhereClause } from "../../types/homepage.types";

export default class FilterOperations {

    public filterNodeList(nodeList: IHandlingUnitsArray, filters: IWhereClause[]): IHandlingUnitsArray {
        const filteredNodeList: IHandlingUnitsArray = nodeList.filter(node => {
            const field = filters[0].ref[0];
            const value = filters[2].val;
            switch (filters[1] as unknown as string) {
                case '=':
                    return node[field] == value;
                default:
                    return true;
            }
        });
        filteredNodeList.$count = filteredNodeList.length;
        return filteredNodeList;
    }

    public sortNodes(nodeList: IHandlingUnitsArray, orderBy): IHandlingUnitsArray {
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