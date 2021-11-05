import * as React from 'react';
import './admin-portal.css';
import kyndaLetter from './kyndaletter.png';
import cog from './cog69420.png';

class UserPortalData {
    constructor(id, divs) {
        this.portalId = id;
        this.portalListDivs = divs; // are the divs that appear in the userportal list on the side
        this.companyName = "Concrete Lovers inc."; // get from database
        this.mainUserList = {69420: "Barend Ballebak"}; // get from database; is {mainUserId: "mainUserName"}, also can be more than 1 (should we even allow more? idk)
        this.registeredEmployeeList = {0: "Henkje Geisterbrei", 1: "Sinter Klaas"}; //get from database; is {employeeId: "employeeName"}
        this.importedTemplateList = [6, 8, 21]; // get from database; is [templateId, templateId...]
        this.designDownloadList = {6: 12, 8: 0, 21: 5}; // get from database; is {templateId: amount of downloaded designs w this templateId}
    }
}

let userPortalAmount = 10; // temp value, should be amount of user-portals, get from database
let userPortalDivList = [] // array for divs
let userPortalList = []; // array of UserPortalData objects

DrawUserPortals();

export default {
    url: '/admin-portal',
    Render: (queryParams) => {
        const [userPortalList1, SetUserPortalList] = React.useState([]);
        return (
            <React.Fragment>
                {/* menubar bijna tzelfde als die in user-portal.js */}
                <div class="menuBarAdmin">
                    <div class="kyndaLogo">
                        <img src={kyndaLetter} width="104" height="55" />
                    </div>
                    <div class="adminPortalHeader">Adminportaal</div>
                    <div class="dropDown">
                        <label for="menu"> Opties: </label>
                        <select name="menu" id="menu">
                            <option value="optie1">optie1</option>
                            <option value="optie2">optie2</option>
                            <option value="optie3">optie3</option>
                            <option value="optie4">optie4</option>
                        </select>
                    </div>
                    <div class="logOutButton">
                        <loguitbutton>Uitloggen</loguitbutton>
                    </div>
                    <div class="kyndaCog">
                        <img src={cog} width="40" height="40" />
                    </div>
                </div>

                <div class="mainPage">
                    <div class="listViewTxtBox">
                        <p class="listViewTxt">User Portals</p>
                        
                    </div>
                    <div class="midSection">
                        <div class="userPortalList" id="userPortalList">
                            {userPortalDivList}
                        </div>
                        <div class="mainView">
                            <div class="topLayerMainView">
                                <div class="mainViewHeader" id="mainViewHeader"></div>
                            </div>
                        </div>
                        {/*<div class="downloadstatistics">
                            <div class="templatedownloadsbox">
                                <div class="statheader">Templates</div>
                                {drawstatisticstemplates()}
                            </div>
                            <div class="designdownloadsbox">
                                <div class="statheader">Designs</div>
                                {drawstatisticsdesigns()}
                            </div>
                        </div>*/}
                    </div>
                    <div class="listViewTxtBox">
                        <p
                            class="addUserPortalButton"
                            onClick={() =>
                                SetUserPortalList(
                                    userPortalDivList.push(AddUserPortal())
                                )
                            }
                        >
                            User Portal Toevoegen
                        </p>
                        
                    </div>
                </div>
            </React.Fragment>
        );
    },
};

function DrawUserPortals() {
    // function to generate user-portal list-view
    for (let listPos = 1; listPos <= userPortalAmount; listPos++) {
        let id = "selector " + listPos;
        let temp = new UserPortalData(
            listPos,
            <div class="userPortalItemBox">
                <div class="userPortalItem">
                    {"User Portal " + listPos} <br />
                    {"S.T.D. Wines & Liquors inc."}
                    <div class="selectUserPortalButton" id={id} onClick = {() => SelectUser(id)}>Selecteren</div>
                </div>
            </div>
        );
        userPortalDivList.push(temp.portalListDivs);
        userPortalList.push(temp);
    }
}

function SelectUser(id) {
    const pos = id.replace('selector ', '');
    document.getElementById("mainViewHeader").innerHTML = "User Portal " + userPortalList[pos - 1].portalId;
    // continue making selection screen; isn't hidden yet for testing reasons
}

function AddUserPortal() {
    let id = "selector " + (userPortalList.length + 1);
    let temp = new UserPortalData(
        userPortalList.length + 1,
        <div class="userPortalItemBox">
            <div class="userPortalItem">
                {"User Portal " + (userPortalList.length + 1)} <br />
                {"S.T.D. Wines & Liquors inc."}
                <div class="selectUserPortalButton" id={id} onClick = {() => SelectUser(id)}>Selecteren</div>
            </div>
        </div>
    );
    userPortalDivList.push(temp.portalListDivs);
    userPortalList.push(temp);
}

/*function drawstatisticstemplates() {
    let templates = {1: 5, 2: 11, 3: 10, 4: 6, 5: 4, 6: 20, 7: 11, 8: 16, 9: 2, 10: 43}; // temp value, is dictionary with key=templateId & value=downloadamount, get from database (not sure if downloads have to be per template & per user portal or just per template)
    let stats = [];
    for (var key in templates) {
        stats.push(
            <div class="templatedownloads"> 
                <div class="templatedownloadstxt">
                    Template {key} <br/>
                    Aantal Downloads = {templates[key]}
                </div>
            </div>
        );
    }
    return stats;
}

function drawstatisticsdesigns() {
    let designs = {1: 22, 2: 3, 3: 741, 4: 9, 5: 20, 6: 14, 7: 10, 8: 41, 9: 7, 10: 89}; // temp value, is dictionary with key=userportalId & value=downloadamount, get from database
    let stats = [];
    for (var key in designs) {
        stats.push(<div class="designdownloads">
                <div class="designdownloadstxt">
                    User Portal {key} <br/>
                    Aantal Downloads = {designs[key]}
                </div>
            </div>
        );
    }
    return stats;
}*/
