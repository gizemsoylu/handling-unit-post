import { OnEventHandler, TypedRequest, connect, operator } from "@sap/cds";
import { IHandlingUnits, IHandlingUnitItems, IHandlingUnitsArray, IWhereClause, IStorageBins, IOrderByClause, IMoveHUBody } from "../../types/homepage.types";
import FilterOperations from "../util/FilterOperations";
import DataOperations from "../util/DataOperations";

const getHandlingUnits: OnEventHandler = async function (req: TypedRequest<IHandlingUnits>): Promise<IHandlingUnits[]> {
    const dataOperations = new DataOperations();
    const filterOperations = new FilterOperations();

    const handlingCDS = await connect.to("YY1_HUINFOPALLETBOX");
    const { YY1_HUInfoPalletbox_ewm } = handlingCDS.entities;
    const whereClause = req.query.SELECT?.where as any[];

    const cleanedWhereClause = whereClause ? filterOperations.removeFilters(whereClause, ["HierarchyLevel", "ParentNodeID"]) : null;

    const parentNodeID = FilterOperations.getGlobalParentNodeID();
    const hierarchyLevel = parentNodeID ? 1 : 0;

    const extendedWhereClause = cleanedWhereClause?.reduce<(string | IWhereClause)[]>((acc, item, index, array) => {
        if (typeof item === "object" && item.xpr) {
            let skipXprIndexes = 0;

            const modifiedXpr = item.xpr.reduce<(string | IWhereClause)[]>((xprAcc, xprItem, xprIndex, xprArray) => {
                if (skipXprIndexes > 0) {
                    skipXprIndexes--;
                    return xprAcc;
                }

                if (typeof xprItem === "object" && xprItem.ref?.[0] === "HandlingUnitNumber") {
                    const nextXprItem = xprArray[xprIndex + 2];
                    if (typeof nextXprItem === "object" && nextXprItem.val) {
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
                    const nextXprItem = xprArray[xprIndex + 2];
                    if (typeof nextXprItem === "object" && nextXprItem.val) {
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

                        skipXprIndexes = 2;
                        return xprAcc;
                    }
                }

                xprAcc.push(xprItem);
                return xprAcc;
            }, []);

            acc.push({ ...item, xpr: modifiedXpr });
            return acc;
        }

        if (typeof item === "object" && item.ref?.[0] === "HandlingUnitNumber") {
            const nextItem = array[index + 2];
            if (typeof nextItem === "object" && nextItem.val) {
                const handlingUnitValue = String(nextItem.val).padStart(20, "0");

                acc.push({
                    xpr: [
                        { ref: ["HandlingUnitNumber"] }, "=", { val: handlingUnitValue },
                        "or",
                        { ref: ["HandlingUnitNumber_1"] }, "=", { val: handlingUnitValue }
                    ]
                } as IWhereClause);

                return acc;
            }
        }

        if (typeof item === "object" && item.ref?.[0] === "HandlingUnitStatus") {
            const nextItem = array[index + 2];
            if (typeof nextItem === "object" && nextItem.val) {
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

                index += 2;
                if (array[index + 1] === "and" || array[index + 1] === "or") {
                    index += 1;
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

    const additionalFilter = [
        { ref: ["HandlingUnitIndicator"] },
        "!=",
        { val: "A" }
    ];

    let finalWhereClause: any[] = extendedWhereClause
        ? [...extendedWhereClause, "and", ...additionalFilter]
        : additionalFilter;


    let huPallets = await handlingCDS.run(SELECT.from(YY1_HUInfoPalletbox_ewm).where(finalWhereClause));

    const parentNodeMap = new Map<string, { nodeId: number, subNodes: string[] }>();
    let nodeList: IHandlingUnitsArray = [];
    let nodeId = 1;

    huPallets.forEach((huItems: IHandlingUnitItems) => {
        huItems = dataOperations.formatHUItems(huItems);
    });

    huPallets.forEach(huItems => {
        const result = dataOperations.handleParentNode(parentNodeMap, huItems, nodeList, nodeId);
        nodeList = result.nodeList;
        nodeId = result.nodeId;
    });

    if (hierarchyLevel == 0) {
        nodeList = nodeList.filter(item =>
            item.HierarchyLevel !== null &&
            item.HierarchyLevel !== undefined &&
            +item.HierarchyLevel === +hierarchyLevel
        );
    }

    if (parentNodeID) {
        nodeList = nodeList.filter(item =>
            item.ParentNodeID !== null &&
            item.ParentNodeID !== undefined &&
            +item.ParentNodeID === +parentNodeID
        );

        let matchingKey: string = "";
        for (const [key, value] of parentNodeMap.entries()) {
            if (value.nodeId === +parentNodeID) {
                matchingKey = key;
                break;
            }
        }

        const matchingNode = parentNodeMap.get(matchingKey);
        if (matchingNode)
            for (const huItems of huPallets) {
                const result = await dataOperations.handleChildNodes(
                    matchingNode,
                    huItems,
                    nodeList,
                    nodeId,
                    huPallets,
                    handlingCDS,
                    YY1_HUInfoPalletbox_ewm
                );
                nodeList = result.nodeList;
                nodeId = result.nodeId;
            }
        nodeList = dataOperations.updateNodeList(nodeList);
    }

    nodeList.forEach(node => {
        const parentNode = parentNodeMap.get(node.HandlingUnitNumber);

        if (parentNode && parentNode.subNodes.length) {
            node.DrillState = "expanded";
        } else {
            node.DrillState = "collapse";
        }
    });


    if (req.query.SELECT?.orderBy) {
        const orderBy = req.query.SELECT.orderBy as unknown as IOrderByClause[];
        nodeList = filterOperations.sortNodes(nodeList, orderBy);
    }

    FilterOperations.setGlobalParentNodeID(null);

    nodeList.$count = nodeList.length;
    return nodeList;
};

const moveHandlingUnits: OnEventHandler = async function (req: TypedRequest<IMoveHUBody>): Promise<void> {
    try {
        const { moveHUs } = req.data;

        await Promise.allSettled(moveHUs.map(async (item) => {
            const { DestinationStorageBin, DestinationStorageType, SourceHandlingUnit, WarehouseProcessType, EWMWarehouse } = item;
            const body = { DestinationStorageBin, DestinationStorageType, SourceHandlingUnit, WarehouseProcessType, EWMWarehouse };
            const warehouseOrderSrv = await connect.to("WAREHOUSEORDER");
            let success = false;
            let lastErrorMessage = "";

            while (!success) {
                try {
                    const response = await warehouseOrderSrv.send("POST", "/WarehouseTask", body);
                    success = true;
                    return response;
                } catch (error) {
                    if (error instanceof Error) {
                        lastErrorMessage = error.message;

                        if (error.message.includes("already being processed by user") || error.message.includes("al bewerkt door gebruiker")) {
                            continue;
                        } else {
                            break;
                        }
                    }
                }
            }

            if (!success) {
                req.error({
                    code: 'Create-Warehouse-Task',
                    message: lastErrorMessage,
                    target: 'EWMStorageBin',
                    status: 500
                });
            }
        }));
    } catch (error) {
        if (error instanceof Error) {
            req.error({
                code: 'Create-Warehouse-Task',
                message: error.message,
                target: 'EWMStorageBin',
                status: 500
            });
        } else {
            req.error({
                code: 'Create-Warehouse-Task',
                message: "Unknown error has occured.Please contact with your administrator.",
                target: 'EWMStorageBin',
                status: 500
            });
        }
    }
};

/* ======================================================================================================================= */
/* Value Help Operations                                                                                                   */
/* ======================================================================================================================= */

const getHandlingUnitStatus: OnEventHandler = async function (req: TypedRequest<{ HandlingUnitStatus: string }[]>): Promise<{ HandlingUnitStatus: string }[]> {
    return [{ HandlingUnitStatus: "Planned" }, { HandlingUnitStatus: "Received" }];
}

const getHandlingUnitEWMHouses: OnEventHandler = async function (req: TypedRequest<{ EWMWarehouse: string }[]>): Promise<{ EWMWarehouse: string }[]> {
    const handlingCDS = await connect.to("YY1_HUINFOPALLETBOX");
    const allEWMWarehouses = await handlingCDS.run(SELECT.from('YY1_HUInfoPalletbox_ewm').columns('EWMWarehouse').where({
        PackagingMaterialType: ['Z001', 'Z002']
    }));

    let uniqueEWMWarehouses: { EWMWarehouse: string }[] = [];

    allEWMWarehouses.forEach((item: { EWMWarehouse: string; }) => {
        if (item.EWMWarehouse !== '' && !uniqueEWMWarehouses.some(warehouse => warehouse.EWMWarehouse === item.EWMWarehouse)) {
            uniqueEWMWarehouses.push({ EWMWarehouse: item.EWMWarehouse });
        }
    });

    return uniqueEWMWarehouses;
}

const getHandlingUnitNumbers: OnEventHandler = async function (
    req: TypedRequest<{ HandlingUnitNumber: string }[]>
): Promise<{ HandlingUnitNumber: string }[]> {
    try {
        const handlingCDS = await connect.to("YY1_HUINFOPALLETBOX");

        let allHUsQuery = SELECT.from('YY1_HUInfoPalletbox_ewm')
            .columns(['HandlingUnitNumber'])
            .where({ PackagingMaterialType: ['Z001', 'Z002'] });

        if ((req.query.SELECT as any)?.search) {
            const filters = (req.query.SELECT as any).search as IWhereClause[];
            const firstFilter = filters[0];
            if (typeof firstFilter === "object" && firstFilter.val) {
                const searchValue = String(firstFilter.val);

                allHUsQuery = allHUsQuery.and(
                    `(startswith(HandlingUnitNumber, '${searchValue}') or endswith(HandlingUnitNumber, '${searchValue}'))`
                );
            }
        }

        const allHUs = await handlingCDS.run(allHUsQuery) as { HandlingUnitNumber: string }[];

        const uniqueHUs = Array.from(
            new Set(allHUs.map((item) =>
                item.HandlingUnitNumber.replace(/^0+/, '')
            ))
        ).map(hu => ({ HandlingUnitNumber: hu }));

        return uniqueHUs;

    } catch (error) {
        console.error("Error in getHandlingUnitNumbers: ", error);
        throw new Error("Failed to fetch handling unit numbers");
    }
};


const getProducts: OnEventHandler = async function (req: TypedRequest<{ Product: string }[]>): Promise<{ Product: string }[]> {
    try {
        const handlingCDS = await connect.to("YY1_HUINFOPALLETBOX");

        let productQuery = SELECT.from('YY1_HUInfoPalletbox_ewm')
            .columns(['Product'])
            .where("Product != ''");

        if ((req.query.SELECT as any)?.search) {
            const filters = (req.query.SELECT as any).search as IWhereClause[];
            const firstFilter = filters[0];

            if (typeof firstFilter === "object" && firstFilter.val) {
                const searchValue = String(firstFilter.val);

                productQuery = productQuery.and(
                    `(startswith(Product, '${searchValue}') or endswith(Product, '${searchValue}') or contains(Product, '${searchValue}'))`
                );
            }
        }

        const allProducts = await handlingCDS.run(productQuery) as { Product: string }[];

        const uniqueProducts = Array.from(
            new Set(allProducts.map(item => item.Product))
        ).map(product => ({ Product: product }));

        return uniqueProducts;

    } catch (error) {
        console.error("Error in getProducts: ", error);
        throw new Error("Failed to fetch products");
    }
};

const getVHStorageBins: OnEventHandler = async function (req: TypedRequest<{ EWMStorageBin_1: string }[]>): Promise<{ EWMStorageBin: string }[]> {
    try {
        const handlingCDS = await connect.to("YY1_HUINFOPALLETBOX");

        let storageBinQuery = SELECT.from('YY1_HUInfoPalletbox_ewm')
            .columns(['EWMStorageBin_1'])
            .where("EWMStorageBin_1 != ''");

        if ((req.query.SELECT as any)?.search) {
            const filters = (req.query.SELECT as any).search as IWhereClause[];
            const firstFilter = filters[0];

            if (typeof firstFilter === "object" && firstFilter.val) {
                const searchValue = String(firstFilter.val);

                storageBinQuery = storageBinQuery.and(
                    `(startswith(EWMStorageBin_1, '${searchValue}') or endswith(EWMStorageBin_1, '${searchValue}') or contains(EWMStorageBin_1, '${searchValue}'))`
                );
            }
        }

        const allStorageBins = await handlingCDS.run(storageBinQuery) as { EWMStorageBin_1: string }[];

        const uniqueStorageBins = Array.from(
            new Set(allStorageBins.map(item => item.EWMStorageBin_1))
        ).map(bin => ({ EWMStorageBin: bin }));

        return uniqueStorageBins;

    } catch (error) {
        console.error("Error in getVHStorageBins: ", error);
        throw new Error("Failed to fetch storage bins");
    }
};

const getStorageTypes: OnEventHandler = async function (req: TypedRequest<{ EWMStorageType_1: string }[]>): Promise<{ EWMStorageType: string }[]> {
    try {
        const handlingCDS = await connect.to("YY1_HUINFOPALLETBOX");

        let storageTypeQuery = SELECT.from('YY1_HUInfoPalletbox_ewm')
            .columns(['EWMStorageType_1'])
            .where("EWMStorageType_1 != '' and PackagingMaterialType in ('Z001', 'Z002')");

        if ((req.query.SELECT as any)?.search) {
            const filters = (req.query.SELECT as any).search as IWhereClause[];
            const firstFilter = filters[0];

            if (typeof firstFilter === "object" && firstFilter.val) {
                const searchValue = String(firstFilter.val);

                storageTypeQuery = storageTypeQuery.and(
                    `(startswith(EWMStorageType_1, '${searchValue}') or endswith(EWMStorageType_1, '${searchValue}') or contains(EWMStorageType_1, '${searchValue}'))`
                );
            }
        }

        const allStorageTypes = await handlingCDS.run(storageTypeQuery) as { EWMStorageType_1: string }[];

        const uniqueStorageTypes = Array.from(
            new Set(allStorageTypes.map(item => item.EWMStorageType_1))
        ).map(type => ({ EWMStorageType: type }));

        return uniqueStorageTypes;

    } catch (error) {
        console.error("Error in getStorageTypes: ", error);
        throw new Error("Failed to fetch storage types");
    }
};

const getProductionOrders: OnEventHandler = async function (req: TypedRequest<{ ProductionOrder: string }[]>): Promise<{ ProductionOrder: string }[]> {
    try {
        const handlingCDS = await connect.to("YY1_HUINFOPALLETBOX");

        let productionOrderQuery = SELECT.from('YY1_HUInfoPalletbox_ewm')
            .columns(['ProductionOrder'])
            .where("ProductionOrder != ''");

        if ((req.query.SELECT as any)?.search) {
            const filters = (req.query.SELECT as any).search as IWhereClause[];
            const firstFilter = filters[0];

            if (typeof firstFilter === "object" && firstFilter.val) {
                const searchValue = String(firstFilter.val);

                productionOrderQuery = productionOrderQuery.and(
                    `(startswith(ProductionOrder, '${searchValue}') or endswith(ProductionOrder, '${searchValue}') or contains(ProductionOrder, '${searchValue}'))`
                );
            }
        }

        const allOrders = await handlingCDS.run(productionOrderQuery) as { ProductionOrder: string }[];

        const uniqueOrders = Array.from(
            new Set(allOrders.map(item => item.ProductionOrder))
        ).map(order => ({ ProductionOrder: order }));

        return uniqueOrders;

    } catch (error) {
        console.error("Error in getProductionOrders: ", error);
        throw new Error("Failed to fetch production orders");
    }
};


const getEWMWarehouseBins: OnEventHandler = async function (req: TypedRequest<{ EWMWarehouse: string }>): Promise<IStorageBins[]> {
    try {
        const EWMWarehouse = req.data.EWMWarehouse;

        const storageService = await connect.to("WAREHOUSESTORAGEBIN");
        const { WarehouseStorageBin } = storageService.entities;

        let storageBinQuery = SELECT.from(WarehouseStorageBin).where({ EWMWarehouse });

        if ((req.query.SELECT as any)?.search) {
            const filters = (req.query.SELECT as any).search as IWhereClause[];
            const firstFilter = filters[0];

            if (typeof firstFilter === "object" && firstFilter.val) {
                const searchValue = String(firstFilter.val);

                storageBinQuery = storageBinQuery.and(
                    `(startswith(EWMStorageBin, '${searchValue}') or endswith(EWMStorageBin, '${searchValue}') or contains(EWMStorageBin, '${searchValue}'))`
                );
            }
        }

        const storageBins = await storageService.run(storageBinQuery) as IStorageBins[];

        return storageBins;

    } catch (error) {
        console.error("Error in getEWMWarehouseBins: ", error);
        throw new Error("Failed to fetch warehouse bins");
    }
};

const getStorageBins: OnEventHandler = async function (req: TypedRequest<IStorageBins[]>): Promise<IStorageBins[]> {
    try {
        const storageService = await connect.to("WAREHOUSESTORAGEBIN");
        const { WarehouseStorageBin } = storageService.entities;

        let storageBinQuery = SELECT.from(WarehouseStorageBin);

        if (req.query.SELECT?.where) {
            storageBinQuery = storageBinQuery.where(req.query.SELECT.where);
        }

        if ((req.query.SELECT as any)?.search) {
            const filters = (req.query.SELECT as any).search as IWhereClause[];
            const firstFilter = filters[0];

            if (typeof firstFilter === "object" && firstFilter.val) {
                const searchValue = String(firstFilter.val);

                storageBinQuery = storageBinQuery.and(
                    `(startswith(EWMStorageBin, '${searchValue}') or endswith(EWMStorageBin, '${searchValue}') or contains(EWMStorageBin, '${searchValue}'))`
                );
            }
        }

        const storageBins = await storageService.run(storageBinQuery) as IStorageBins[];

        return storageBins;

    } catch (error) {
        console.error("Error in getStorageBins: ", error);
        throw new Error("Failed to fetch storage bins");
    }
};


export {
    getHandlingUnits,
    getStorageBins,
    getEWMWarehouseBins,
    getHandlingUnitStatus,
    moveHandlingUnits,
    getHandlingUnitEWMHouses,
    getHandlingUnitNumbers,
    getProductionOrders,
    getVHStorageBins,
    getStorageTypes,
    getProducts
}