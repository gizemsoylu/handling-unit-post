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
}