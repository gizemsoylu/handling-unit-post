import { IHandlingUnitItems, IHandlingUnitsArray, IWhereClause } from "../../types/homepage.types";

export default class DataOperations {
    public convertStatus(HandlingUnitStatus: string): string {
        switch (HandlingUnitStatus) {
            case 'A':
                return 'Planned';
            case 'B':
                return 'Received';
            case 'C':
                return 'Shipped';
            default:
                return '';
        }
    }
    public formatHUItems(huItems: IHandlingUnitItems): IHandlingUnitItems {
        huItems.QuantityPerHU = huItems.QuantityPerHu ? +huItems.QuantityPerHu : 0;
        huItems.HUNumber = huItems.HandlingUnitNumber.replace(/^0+/, '');
        huItems.SubHUNumber = huItems.HandlingUnitNumber_1.replace(/^0+/, '');
        huItems.HUType = huItems.HandlingUnitType;
        huItems.HUStatus = this.convertStatus(huItems.HandlingUnitStatus);
        huItems.SubEWMWarehouse = huItems.EWMWarehouse_1;
        huItems.EWMWarehouse = huItems.EWMWarehouse;
        huItems.CreationDate = huItems.CreationDateTime ? huItems.CreationDateTime : null;
        return huItems;
    }

    public handleParentNode(
        huItems: IHandlingUnitItems,
        parentNodeMap: { [key: string]: number },
        nodeList: IHandlingUnitsArray,
        nodeId: number
    ): { nodeList: IHandlingUnitsArray, nodeId: number } {
        if (!parentNodeMap[huItems.HUNumber]) {
            parentNodeMap[huItems.HUNumber] = nodeId;
            nodeList.push({
                ...huItems,
                ProductionOrder: "",
                PackagingMaterial: "PALLET",
                NodeID: nodeId,
                HierarchyLevel: 0,
                ParentNodeID: null,
                DrillState: "expanded"
            });
            nodeId++;
        }
        return { nodeList, nodeId };
    }

    public handleChildNode(
        huItems: IHandlingUnitItems,
        parentNodeMap: { [key: string]: number },
        nodeList: IHandlingUnitsArray,
        nodeId: number
    ): { nodeList: IHandlingUnitsArray, nodeId: number } {
        if (huItems.SubHUNumber) {
            if (!nodeList.some(node => node.HUNumber === huItems.SubHUNumber && node.ParentNodeID === parentNodeMap[huItems.HUNumber])) {
                nodeList.push({
                    ...huItems,
                    HUNumber: huItems.SubHUNumber.replace(/^0+/, ''),
                    SubHUNumber: "",
                    NodeID: nodeId,
                    HierarchyLevel: 1,
                    ParentNodeID: parentNodeMap[huItems.HUNumber],
                    DrillState: "collapse"
                });
                parentNodeMap[huItems.SubHUNumber] = nodeId;
                nodeId++;
            }
        }
        return { nodeList, nodeId };
    }

    public updateNodeList(nodeList: IHandlingUnitsArray): IHandlingUnitsArray {
        nodeList.forEach(node => {
            if (node.HierarchyLevel === 0) {
                const childNodes = nodeList.filter(child => child.ParentNodeID === node.NodeID);
                const hasChild = childNodes.length > 0;
                node.DrillState = hasChild ? "expanded" : "collapse";
                node.SubHUNumber = hasChild ? "" : node.SubHUNumber;
                node.CreationDate = hasChild ? null : node.CreationDate;

                if (hasChild) {
                    const allSameMaterial = childNodes.every(child => child.MaterialNumber === childNodes[0].MaterialNumber);
                    const allSameStatus = childNodes.every(child => child.HUStatus === childNodes[0].HUStatus);
                    if (allSameMaterial) {
                        node.MaterialNumber = childNodes[0].MaterialNumber;
                        node.QuantityPerHU = childNodes.reduce((sum, child) => sum + (child.QuantityPerHU || 0), 0);
                    } else {
                        node.MaterialNumber = "Multiple Materials";
                        node.QuantityPerHU = null;
                    }
                    if (allSameStatus) {
                        node.HUStatus = childNodes[0].HUStatus;
                    } else {
                        node.HUStatus = "";
                    }
                }
            }
        });
        return nodeList;
    }
}