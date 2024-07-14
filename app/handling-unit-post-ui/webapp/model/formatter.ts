export default {

    setStatusHighlight: function (status:string) {
        let sObjectState = "";
        switch (status) {
            case "Planned":
                sObjectState = "Information";
                break;
            case "Received":
                sObjectState = "Warning";
                break;
            case "Shipped":
                sObjectState = "Success";
                break;
            default:
                sObjectState = "None";
                break;
        }
        return sObjectState;
    }
   
} 