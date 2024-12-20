
import BaseController from "./BaseController";
import formatter from "../model/formatter"
import { Button$ClickEvent } from "sap/ui/webc/main/Button";
import BusyIndicator from "sap/ui/core/BusyIndicator";
import EntryCreateCL from "ui5/antares/entry/v2/EntryCreateCL";
import MessageBox from "sap/m/MessageBox";
import { IStorageBins, IMoveHUtoBin, Routes, IMoveHUBody } from "../types/global.types";
import ResponseCL from "ui5/antares/entry/v2/ResponseCL";
import { ISubmitResponse } from "ui5/antares/types/entry/submit";
import { FormTypes } from "ui5/antares/types/entry/enums";
import TreeTable from "sap/ui/table/TreeTable";
import Context from "sap/ui/model/Context";
import ODataCreateCL from "ui5/antares/odata/v2/ODataCreateCL";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import { smartfield } from "sap/ui/comp/library";
import { Table$RowSelectionChangeEvent } from "sap/ui/table/Table";
import ValueHelpCL from "ui5/antares/ui/ValueHelpCL";
import ValueHelpDialog from "sap/ui/comp/valuehelpdialog/ValueHelpDialog";
import Input from "sap/m/Input";
import ODataReadCL from "ui5/antares/odata/v2/ODataReadCL";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import Messaging from "sap/ui/core/Messaging";
import Message from "sap/ui/core/message/Message";
import MessageType from "sap/ui/core/message/MessageType";
import { Model$RequestFailedEvent } from "sap/ui/model/Model";
import PageCL from "../util/PageCL";
import SmartTable from "sap/ui/comp/smarttable/SmartTable";
import ODataListBinding from "sap/ui/model/odata/v2/ODataListBinding";
import Dialog from "sap/m/Dialog";
import Control from "sap/ui/core/Control";
import { ExportBase$BeforeExportEvent } from "sap/ui/export/ExportBase";

/**
 * @namespace com.ndbs.handlingunitpostui.controller
 */
export default class Homepage extends BaseController {
    public formatter = formatter;
    private entry: EntryCreateCL;
    private EWMWarehouse: string;
    private HandlingUnitNumber: string;
    private EWMStorageBin: string;

    /* ======================================================================================================================= */
    /* Lifecycle methods                                                                                                       */
    /* ======================================================================================================================= */

    public onInit(): void {
        const page = new PageCL<Homepage>(this, Routes.HOMEPAGE);
        page.initialize();
    }

    /* ======================================================================================================================= */
    /* Event Handlers                                                                                                          */
    /* ======================================================================================================================= */

    public onMoveHandlingUnit(event: Button$ClickEvent) {
        const selectesIndex = (this.byId("uiTreeHandlingUnit") as TreeTable).getSelectedIndices() as number[];
        if (!selectesIndex.length) {
            MessageBox.error(this.getResourceBundleText("noSelectedItem"));
        } else {
            BusyIndicator.show(1);

            this.EWMWarehouse = (((this.byId("uiTreeHandlingUnit") as TreeTable)
                .getContextByIndex(selectesIndex[0]) as Context).getObject() as { EWMWarehouse: string }).EWMWarehouse
            this.entry = new EntryCreateCL<IStorageBins[]>(this, "StorageBins");
            this.entry.setBeginButtonText(this.getResourceBundleText("moveHU"));
            this.entry.setEndButtonText(this.getResourceBundleText("cancel"));
            this.entry.setFormTitle(this.getResourceBundleText("selectBin"));
            this.entry.setReadonlyProperties(["EWMWarehouse"])
            this.entry.setMandatoryProperties(["EWMStorageBin"]);
            this.entry.setExcludedProperties(["EWMStorageType"]);
            this.entry.setTextInEditModeSource([{
                propertyName: "EWMStorageBin",
                textInEditModeSource: smartfield.TextInEditModeSource.ValueList
            }]);
            this.entry.setUseMetadataLabels(true);
            this.entry.setDisableAutoClose(true);
            this.entry.setFormType(FormTypes.SIMPLE);
            this.entry.registerManualSubmit(this.onMoveHUManualSubmit, this);
            this.entry.attachSubmitFailed(this.onMoveHUSubmitFailed, this);

            const storageBinVH = new ValueHelpCL(this, {
                useMetadataLabels: true,
                propertyName: "EWMStorageBin",
                valueHelpEntity: "StorageBins",
                valueHelpProperty: "EWMStorageBin",
                readonlyProperties: ["EWMStorageType", "EWMWarehouse"],
                filterCaseSensitive: true,
                title: this.getResourceBundleText("selectBin")
            });

            this.entry.addValueHelp(storageBinVH);

            storageBinVH.setInitialFilters([{
                propertyName: "EWMWarehouse",
                value: this.EWMWarehouse
            }])

            storageBinVH.attachAfterDialogOpened((dialog: ValueHelpDialog) => {
                const filterItems = dialog.getFilterBar().getFilterGroupItems();
                filterItems.forEach((item) => {
                    if (item.getName() === "EWMWarehouse") {
                        (item.getControl() as Input).setEditable(false)
                    }
                })
            }, this)

            this.entry.createNewEntry({
                EWMWarehouse: this.EWMWarehouse
            });

            const newEntryDialog = this.entry.getGeneratedDialog();
            newEntryDialog.attachAfterOpen((event) => {
                const dialog = event.getSource() as Dialog;
                const contentAggregation = dialog.getAggregation("content") as Input;

                if (contentAggregation && Array.isArray(contentAggregation) && contentAggregation.length > 0) {
                    const input = contentAggregation[0]
                    const formContent = input.getContent();

                    if (formContent && formContent.length > 3) {
                        (formContent[3] as Control).focus();
                    }
                }
            }, this);
            BusyIndicator.hide();
        }
    }

    public onClearSelectedItem(): void {
        const table = this.byId("uiTreeHandlingUnit") as TreeTable
        const selectedIndices = table.getSelectedIndices();
        const lastIndex = selectedIndices[selectedIndices.length - 1];
        table.removeSelectionInterval(selectedIndices[0], lastIndex);
    }

    public onBeforeExport(event: ExportBase$BeforeExportEvent): void {
        const exportSettings = event.getParameter("exportSettings") as {
            dataSource: {
                count: number;
                downloadLimit: number;
            };
        };

        if (exportSettings && exportSettings.dataSource) {
            const table = this.byId("uiTreeHandlingUnit") as TreeTable;
            const rowBinding = table.getBinding("rows") as ODataListBinding;
            const length = rowBinding.getLength();

            exportSettings.dataSource.count = length;
            exportSettings.dataSource.downloadLimit = length;
        }
    }

    /* ======================================================================================================================= */
    /* Internal Handlers                                                                                                       */
    /* ======================================================================================================================= */

    public onObjectMatched(): void {
        const oDataModel = this.getComponentModel();
        oDataModel.attachRequestFailed({}, this.onODataRequestFail, this);
    }

    public onODataRequestFail(event: Model$RequestFailedEvent): void {
        // this.openMessagePopover();
    }

    private async onHUSelectionChange(event: Table$RowSelectionChangeEvent) {
        const rowContext = event.getParameter("rowContext") as Context;
        const rowIndex = event.getParameter("rowIndex") as number;
        const table = this.byId("uiTreeHandlingUnit") as TreeTable;
        const parentNodeID = (rowContext.getObject() as { ParentNodeID: string }).ParentNodeID

        if (parentNodeID) {
            table.removeSelectionInterval(rowIndex, rowIndex);
        }
    }

    private onMoveHUSubmitFailed(response: ResponseCL<ISubmitResponse>) {
        this.entry.closeAndDestroyEntryDialog();
    }

    private async onMoveHUManualSubmit(entry: EntryCreateCL) {
        BusyIndicator.show(0);
        this.onClearMessages();
        const smartTable = this.byId("stHandlingUnit") as SmartTable;
        const path = (entry.getEntryContext() as Context).getPath();
        this.EWMStorageBin = (this.getODataModel() as ODataModel).getProperty(path).EWMStorageBin;

        if (!this.EWMStorageBin) {
            BusyIndicator.hide();
            MessageBox.error(this.getResourceBundleText("noSelectedStorageBins"));
            return;
        }

        const odata = new ODataCreateCL<IMoveHUBody>(this, "moveHUtoBin");
        const table = this.byId("uiTreeHandlingUnit") as TreeTable
        const selectedIndices = table.getSelectedIndices();
        const EWMStorageType = await this.getStorageType(this.EWMStorageBin)

        const contexts = selectedIndices.map(index => {
            return ((table.getContextByIndex(index) as Context).getObject() as { HandlingUnitNumber: string });
        });

        const moveHUsArray: IMoveHUtoBin[] = (contexts.map(context => {
            return {
                EWMWarehouse: this.EWMWarehouse,
                SourceHandlingUnit: context.HandlingUnitNumber,
                DestinationStorageBin: this.EWMStorageBin,
                DestinationStorageType: EWMStorageType,
                WarehouseProcessType: "ZRF1"
            };
        }));

        const requestBody: IMoveHUBody = {
            moveHUs: moveHUsArray
        };

        odata.setData(requestBody);

        try {
            await odata.create();
            BusyIndicator.hide();
            const movedHUNumbers = contexts.map(context => context.HandlingUnitNumber).join(", ");
            Messaging.addMessages(new Message({
                message: this.getResourceBundleText("taskCreated", [movedHUNumbers]),
                type: MessageType.Success
            }));
            (this.byId("stHandlingUnit") as SmartTable).rebindTable(true);

            (this.byId("stHandlingUnit") as SmartTable).attachEventOnce("dataReceived", () => {
                table.setFirstVisibleRow(0);
                setTimeout(() => {
                    const rowCount = (table.getBinding("rows") as ODataListBinding).getLength();
                    if (rowCount) {
                        table.setFirstVisibleRow(rowCount - 1);
                    }
                }, 1000);
            });

            this.entry.closeAndDestroyEntryDialog();

            // this.openMessagePopover();
        } catch (error: unknown) {
            BusyIndicator.hide();
            this.entry.closeAndDestroyEntryDialog();
            this.openMessagePopover();
        }

    }

    private async getStorageType(EWMStorageBin: string) {
        const odata = new ODataReadCL<IStorageBins>(this, "StorageBins")
        odata.addFilter(new Filter("EWMWarehouse", FilterOperator.EQ, this.EWMWarehouse));
        odata.addFilter(new Filter("EWMStorageBin", FilterOperator.EQ, this.EWMStorageBin));
        const storageBins = await odata.read();
        return storageBins[0].EWMStorageType
    }
}
