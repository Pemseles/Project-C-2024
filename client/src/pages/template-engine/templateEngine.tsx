﻿// @ts-nocheck

import './templateEngine.css';

import { useEffect, useRef, useState } from 'react';
import { CreateExport } from '../../helpers/Export';
import { readFile, readFileAsDataUrl } from '../../helpers/FileReader';
import { Box, Grid, styled, Typography, AppBar, Toolbar } from '@material-ui/core';
import { Button, Checkbox, FormControl, FormControlLabel, InputLabel, Link, MenuItem, Select, Stack, TextField } from '@mui/material';
import { makeStyles } from '@material-ui/core/styles';
import { getPayloadAsJson, getToken, isAdmin, isEmployee, isModerator } from '../../helpers/Token';
import { PageProps } from '../../@types/app';
import { HtmlData, EntryPoint, TemplateFiles } from '../../@types/templateEngine';
import Api from '../../helpers/Api';
import { mainPage } from '../fotolibrary-pagina/fotolibrary-pagina';
import { Image } from '../../@types/general';
import kyndalogo from './kynda.png';

const ApiInstance = new Api(getToken());

/*
Uitleg:
Hier exporteren wij een object. Dit object bevat een url wat een string is en een render property die is gekoppeld aan een
arrow function.

Dus als wij dit importeren met de naam Example1 kunnen wij render aanroepen door Example1.render() te doen.
In de render method doe je dan je react gedoe dus hoe je dat normaal zou gebruiken.
*/

const Input = styled('input')({
    display: 'none',
});

const useStylesFotoLib = makeStyles(() => ({
    icon: {
        marginRight: '20px',
    },
    cardGrid: {
        padding: '20px 0',
    },
    card: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    cardMedia: {
        paddingTop: '56.25%',
        width: '100%',
        height: '100%',
    },
    cardContent: {
        flexGrow: 1,
    },
}));

/** 
* Algorithm om alle "entrypoints" te vinden in een template. Een entrypoint is een html element die teksten bevat.
*/
export function getEntryPointsRecursive(container: HTMLElement, entryPoints: Array<EntryPoint> = [], closestElementWithId: string = "") {
    if (container.children.length === 0) {
        throw Error("Invalid container, does not include children.")
    }

    const children = container.children;
    const entryPoint = entryPoints.filter(point => point.id === closestElementWithId)[0];
    for (let i = 0; i < children.length; i++) {
        const child = children[i] as HTMLElement;
        const childStyles = getComputedStyle(child);

        if (childStyles.backgroundImage !== 'none' && childStyles.backgroundImage !== '') {
            const url = childStyles.backgroundImage.split("\"")[1];

            if (!(url.startsWith('data:'))) {
                const image = findImageByUrl(url);

                if (image !== undefined) {
                    child.style.backgroundImage = `url(${image['data']})`;
                }
            }
        }

        // Assume that we found an entrypoint and give it an appropiate ID
        if (child.id === "" && child.tagName.toLowerCase() === "div" && child.style.length !== 0) {
            child.id = "layer_" + entryPoints.length;
            child.className = "layer";

            entryPoints.push({
                id: child.id,
                element: child,
                spanClasses: [],
                pElements: [],
                spanElements: []
            });
        }

        if (child.tagName.toLowerCase() === "p") {
            entryPoint.pElements.push(child as HTMLParagraphElement);
        }

        if (child.tagName.toLowerCase() === "span") {
            entryPoint.spanElements.push(child as HTMLSpanElement);

            if (!entryPoint.spanClasses.includes(child.className)) {
                entryPoint.spanClasses.push(child.className);
            }
        }

        if (child.children.length !== 0) {
            getEntryPointsRecursive(child, entryPoints, child.id === "" ? closestElementWithId : child.id);
        }
    }

    return entryPoints;
}

function TemplateEngine(props: PageProps) {
    const [templatePos, setTemplatePos] = useState(0);
    const [designs, setDesigns] = useState([]);
    const [templateFiles, setTemplateFiles] = useState<Array<HtmlData>>([]);
    const [selectedElement, setSelectedElement] = useState(null);
    const [textFieldValue, setTextFieldValue] = useState("");
    const [textWrap, setTextWrap] = useState("");
    const [textAlign, setTextAlign] = useState("");
    const [isElementEditable, setIsElementEditable] = useState(false);

    const [isDesignPending, setIsDesignPending] = useState<boolean>(true);

    const [templateName, setTemplateName] = useState("");
    const [designName, setDesignName] = useState("");

    const uploadSectionRef = useRef(null);
    const designSectionRef = useRef(null);
    const editorSectionRef = useRef(null);
    
    const textFieldRef = useRef(null);
    const wrapOptionsRef = useRef(null);
    const alignOptionsRef = useRef(null);
    const editableCheckboxRef = useRef(null);
    const editorFrameRef = useRef(null);
    
    const editableKeyword = 'editable';
    const selectableKeyword = 'selectable';

    const companyId = props.queryParams?.companyId;
    const templateId = props.queryParams?.templateId;
    const designId = props.queryParams?.designId;

    const isTemplateMode = companyId === undefined && templateId !== undefined && designId === undefined;
    const isDesignMode = companyId === undefined && templateId === undefined && designId !== undefined;

    const isAdminTemplateMode = isAdmin() && companyId !== undefined && templateId === undefined && designId === undefined;
    const isAdminDesignMode = isAdmin() && companyId !== undefined && templateId === undefined && designId !== undefined;

    const [fotoLibView, setFotoLibView] = useState(false);
    const [imageList, setImageList] = useState(Array<Image>());
    const queryParamsObject: { queryParams: { [key: string]: string | number } } = { queryParams: { 'companyId': getPayloadAsJson()!.company } };
    const stylesFotoLib = useStylesFotoLib();

    const loadImages = async () => {
        const ApiInstance = new Api(getToken()!);
        const imagesFromDatabase = await ApiInstance.all('image');
        setImageList(Image.makeImageArray(imagesFromDatabase.content));
    };

    useEffect(() => {
        loadImages();

        if (isModerator() && isTemplateMode) {
            ApiInstance.read('template', templateId).then(res => {
                if (res.status === "SUCCESS") {
                    setTemplateFiles(res.content);
                    fetch(process.env.REACT_APP_SERVER_URL + res.content[templatePos].Filepath)
                        .then(res => res.text())
                        .then(html => setTemplateFiles([{name: "", data: html, isFetched: true}]));
                }
            })
        } else if (isAdminDesignMode || (isModerator() || isEmployee() && isDesignMode)) {
            ApiInstance.read('design', designId).then(res => {
                if (res.status === "SUCCESS") {
                    if (res.content[templatePos].Verified === 1) {
                        setIsDesignPending(false);
                    }

                    setDesigns(res.content);
                    fetch(process.env.REACT_APP_SERVER_URL + res.content[templatePos].Filepath)
                        .then(res => res.text())
                        .then(html => setTemplateFiles([{ name: "", data: html, isFetched: true }]));
                }
            })
        }

        if (textFieldRef.current !== null) {
            (textFieldRef.current as HTMLInputElement).value = textFieldValue;
        }

        if (wrapOptionsRef.current !== null) {
            (wrapOptionsRef.current as HTMLInputElement).value = textWrap;
        }

        if (alignOptionsRef.current !== null) {
            (alignOptionsRef.current as HTMLInputElement).value = textAlign;
        }

        if (editableCheckboxRef.current !== null) {
            (editableCheckboxRef.current as HTMLInputElement).checked = selectedElement.classList.contains(editableKeyword);
        }
    }, [])

    function toggleEditorToUpload() {
        editorSectionRef.current.classList.toggle("toggleNone")
        uploadSectionRef.current.classList.toggle("toggleNone")
    }

    function toggleEditorToDesign() {
        editorSectionRef.current.classList.toggle("toggleNone")
        designSectionRef.current.classList.toggle("toggleNone")
    }

    function loadFilesHandler(e) {
        // Omdat het lezen van bestanden asynchrounous gaat, wrappen wij onze for loop in een async functie zodat wij
        // bij onze readFile statements een await mee kunnen geven.
        // Dit zorgt ervoor dat alle promises worden voldaan in sync.

        // Needs some refinement in some areas (mainly lessen the amount of for loops if possible)

        const exportFiles = e.target.files;

        if (e.target.files.length !== 0) {
            (async () => {
                let files: TemplateFiles = {
                    html: [],
                    css: [],
                    images: [],
                    js: [],
                };
    
                const createObj = (file: File, data: string) => ({
                    name: file.name,
                    data: data,
                })
    
                // TODO: Should only ready 1 template and process whenever a new template gets into the screen. Cache like behaviour.
                for (let i = 0; i < exportFiles.length; i++) {
                    const file = exportFiles[i];
    
                    if (file.type === 'text/html') {
                        files['html'].push(createObj(file, await readFile(file)));
                    } else if (file.type === 'text/css') {
                        files['css'].push(createObj(file, await readFile(file)));
                    } else if (file.type === 'text/javascript') {
                        files['js'].push(createObj(file, await readFile(file)));
                    } else if (['image/png', 'image/jpg', 'image/jpeg'].includes(file.type)) {
                        files['images'].push(createObj(file, await readFileAsDataUrl(file)));
                    } else {
                        return;
                    }
                }
    
                let fontDataLoaded = false;
    
                if (!(files['js'].some(obj => obj.name === 'FontData.js'))) {
                    alert("Geen fontdata script gevonden. Tekst kan overlappen.");
                } else {
                    fontDataLoaded = true;
                }
    
                // For every template found in the export directory
                for (let i = 0; i < files['html'].length; i++) {
                    const htmlObj = files['html'][i];
    
                    const doc = new DOMParser().parseFromString(htmlObj.data, 'text/html');
    
                    Array.from(doc.getElementsByTagName('head')[0].children).forEach(child => {
                        if (child.tagName === 'LINK' || child.tagName === 'SCRIPT') child.remove();
                    })
    
                    // Add the contents of the css files as a style element to the html document
                    for (let i = 0; i < files['css'].length; i++) {
                        const node = document.createElement('style');
                        node.innerHTML = files['css'][i]['data'] +
                            `
                                .${selectableKeyword}:hover {
                                    outline: 2rem solid black !important;
                                    outline-radius: 0.8rem !important;
                                    cursor: pointer !important;
                                }
                                .${editableKeyword} {
                                    outline: 2rem solid black !important;
                                    outline-radius: 0.8rem !important;
                                    cursor: pointer !important;
                                }
                            `.replace(/\r?\n|\r/g, '');
    
                        doc.getElementsByTagName('head')[0].appendChild(node);
                    }
    
                    if (fontDataLoaded) {
                        for (let i = 0; i < files['js'].length; i++) {
                            const node = document.createElement('script');
                            const js = files['js'][i]['data'];
    
                            node.innerHTML = js.replace(js.substring(js.indexOf('document'), js.lastIndexOf(';') + 1), `
                            const head = document.getElementsByTagName('head')[0];
                            const styleNode = document.createElement('style');
                            styleNode.innerHTML = buildFontRule(nameArray[i], dataArray[i], fontStyle[i][j], fontWeight[i], fontStretch[i]);
                            head.appendChild(styleNode);`)
    
                            doc.getElementsByTagName('head')[0].appendChild(node);
                        }
                    }

                    const wrapper = doc.getElementById('outer-wrapper');
                    const imgTags = doc.getElementsByTagName('img');

                    // Returns an object that includes the name and the dataUrl (signed as data)
                    const findImageByUrl = (url: string) => files['images'].find(imgObj => imgObj['name'] === url.split('/').at(-1));

                    // Replace image tags sources with data urls
                    for (let i = 0; i < imgTags.length; i++) {
                        const imgTag = imgTags[i];

                        const imgObj = findImageByUrl(imgTag.src);

                        if (imgObj !== undefined) {
                            imgTag.src = imgObj['data'];
                        }
                    }

                    const entryPoints = getEntryPointsRecursive(wrapper);

                    for (let i = 0; i < entryPoints.length; i++) {
                        const point = entryPoints[i];

                        const mergedSpan = [];

                        point.spanClasses.forEach(spanClass => {
                            const span = doc.createElement('span');
                            span.className = spanClass

                            mergedSpan.push(span);
                        })

                        point.pElements.forEach(p => p.remove());
                        
                        const node = document.createElement('script');

                        for (let j = 0; j < mergedSpan.length; j++) {
                            const span = mergedSpan[j];

                            point.spanElements.forEach(el => {
                                if (el.className === span.className) {
                                    span.innerText += el.innerText.trim() + ' ';
                                }
                            })

                            span.innerText = span.innerText.trim();

                            if (span.innerText.length === 0) {
                                continue;
                            }

                            span.id = point.id + "_span_" + j;

                            // Default styling values
                            span.style.display = "block";
                            span.style.lineHeight = 1;
                            span.style.whiteSpace = "normal";
                            span.style.textAlign = "left";
                            span.className += " " + selectableKeyword;

                            span.dataset.textLimit = span.innerText.length;

                            point.element.appendChild(span);
                        }

                        doc.getElementsByTagName('head')[0].appendChild(node);
                    }

                    files['html'][i].data = new XMLSerializer().serializeToString(doc);
                    files['html'][i].isFetched = false;
                }
    
                setTemplateFiles(files['html']);
            })();
        }
    }

    function handleTemplateLoad(e) {
        // TODO: Make compatible for multiple templates
        const doc: Document = e.target.contentDocument;

        if (templateFiles[templatePos].isFetched) {

            doc.querySelectorAll("." + editableKeyword).forEach(el => el.onclick = (e) => {
                setSelectedElement(e.target);
                setTextFieldValue(e.target.innerText);
            });

            return;
        }

        doc.querySelectorAll('.' + selectableKeyword).forEach(span => {
            span.onclick = (e) => {
                setSelectedElement(e.target);
                setTextFieldValue(e.target.innerText);
                setTextWrap(e.target.style.whiteSpace);
                setTextAlign(e.target.style.textAlign);
                setIsElementEditable(e.target.classList.contains(editableKeyword))
            }
        })
    }

    function handleTextChange(e) {
        selectedElement.innerText = e.target.value;
        setTextFieldValue(e.target.value);
    }

    function handleWrapping(e) {
        selectedElement.style.whiteSpace = e.target.value;
        setTextWrap(e.target.value);
    }

    function handleAlign(e) {
        selectedElement.style.textAlign = e.target.value;
        setTextAlign(e.target.value);
    }

    function handleFontSizeUp(e) {
        selectedElement.style.fontSize = (parseInt(window.getComputedStyle(selectedElement, null).getPropertyValue('font-size').replaceAll('px', '')) + parseInt(parseInt(window.getComputedStyle(selectedElement, null).getPropertyValue('font-size').replaceAll('px', '')) / 48) + "px");
    }

    function handleFontSizeDown(e) {
        selectedElement.style.fontSize = (parseInt(window.getComputedStyle(selectedElement, null).getPropertyValue('font-size').replaceAll('px', '')) - parseInt(parseInt(window.getComputedStyle(selectedElement, null).getPropertyValue('font-size').replaceAll('px', '')) / 48) + "px");
    }

    function handleCheckboxEditable(e) {
        const list = selectedElement.classList;

        e.target.checked ? list.add(editableKeyword) : list.remove(editableKeyword);

        setIsElementEditable(list.contains(editableKeyword))
    }

    function handleAdminFormUploadTemplate(e) {
        // Not too sure about this approach, refactor later if possible
        for (let i = 0; i < templateFiles.length; i++) {
            const template = templateFiles[i];

            template.data = new XMLSerializer().serializeToString(editorFrameRef.current.contentDocument);

            const newDoc = new DOMParser().parseFromString(template.data, 'text/html');
            const selectableElements = newDoc.querySelectorAll("." + selectableKeyword);

            for (let i = 0; i < selectableElements.length; i++) {
                selectableElements[i].classList.remove(selectableKeyword);
            }

            ApiInstance.createFile(templateName, `${templateName.replaceAll(' ', '_')}`, new XMLSerializer().serializeToString(newDoc), "template", companyId).then(res => {
                if (res.status === "SUCCESS") {
                    alert("Template is geupload.");
                    toggleEditorToUpload();
                } else {
                    alert("Template is NIET geupload.");
                    toggleEditorToUpload();
                }
            })
        }
    }

    // TODO: new name if possible
    function handleCustomerFormUploadTemplateToDesign(e) {
        // Not too sure about this approach, refactor later if possible
        for (let i = 0; i < templateFiles.length; i++) {
            const template = templateFiles[i];
            ApiInstance.createFile(
                designName,
                `${designName.replaceAll(' ', '_')}_${i}`,
                template.data, 
                "design", 
                getPayloadAsJson()?.company, 
                templateId
            ).then(res => {
                if (res.status === "FAIL") {
                    alert("Design is NIET gemaakt. Er ging iets mis.");
                    toggleEditorToDesign();
                } else if (i === templateFiles.length - 1 && res.status === "SUCCESS") {
                    alert("Design is gemaakt. U kunt het design nog aanpassen zolang het nog niet gevalideerd is.");
                    toggleEditorToDesign();
                }
            })
        }
    }

    function ActionButton(props) {
        return (
            <Button variant="contained" component="span" onClick={e => {
                let confirmResult = window.confirm(props.confirmMessage);

                if (!confirmResult) {
                    alert("Actie geannuleerd");
                } else {
                    if (isAdminTemplateMode) {
                        toggleEditorToUpload();

                        return;
                    }

                    if (isAdminDesignMode || (isModerator() && isDesignMode)) {
                        designs.forEach(design => {
                            const { Id, ...newDesign} = design;
                            newDesign.Updated_at = new Date().toLocaleDateString('en-US');
                            newDesign.Verified = 1;

                            const newDoc = new DOMParser().parseFromString(new XMLSerializer().serializeToString(editorFrameRef.current.contentDocument), 'text/html');
                            const editableElements = newDoc.querySelectorAll("." + editableKeyword);
                            
                            for (let i = 0; i < editableElements.length; i++) {
                                editableElements[i].classList.remove(editableKeyword);
                            }

                            // changed to also update file if necessary
                            ApiInstance.updateFile(
                                newDesign.Name,
                                newDesign.Name,
                                new XMLSerializer().serializeToString(newDoc),
                                "design", 
                                newDesign.Id, 
                                Object.values(newDesign),
                                companyId,
                                newDesign.Template_id,
                            ).then(res => {
                                if (res.status === "SUCCESS") {
                                    alert("Design is goedgekeurd")
                                } else {
                                    alert("Design is NIET goedgekeurd.");
                                }
                            })
                        });

                        return;
                    }

                    if (isModerator() && isEmployee() && isTemplateMode) {
                        toggleEditorToDesign();

                        return;
                    }
                }
            }} style={{ width: "100%" }}>
                {props.text}
            </Button>
        )
    }

    return (
        <>
            <AppBar position="relative" style={{ background: 'white' }}>
                <Toolbar>
                    <img
                        src={kyndalogo}
                        alt="kynda logo"
                        width="90"
                        height="30"
                        style={{ marginRight: '20px' }}
                    />
                    <Typography variant="h5" style={{ color: 'black' }}>
                        Editor
                    </Typography>
                    <Grid container spacing={2} justifyContent="flex-end">
                        <Grid item>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                    document.cookie = document.cookie.substring(
                                        document.cookie.indexOf('token='),
                                        6
                                    );
                                    window.location.replace('/');
                                }}
                            >
                                Uitloggen
                            </Button>
                        </Grid>
                        <Grid item>
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>
            {
                isAdminTemplateMode ?
                    <Box ref={uploadSectionRef} className='toggleNone' sx={{ flexDirection: 'column', justifyContent: 'center', margin: '30px 30% 0 30%'}}>
                    <h1>Upload template</h1>
                    <TextField fullWidth label="Naam" id="fullWidth" style={{ marginTop: "20px" }} onChange={e => setTemplateName(e.target.value)} />
                    <Button variant="contained" style={{ marginTop: "20px" }} onClick={handleAdminFormUploadTemplate}>Upload template</Button>
                    <Button variant="contained" color='error' style={{ marginTop: "20px", marginLeft: "20px" }} onClick={e => {
                        toggleEditorToUpload();
                    }}>Annuleer</Button>
                </Box>
                :
                <Box ref={designSectionRef} className='toggleNone' sx={{ flexDirection: 'column', justifyContent: 'center', margin: '30px 30% 0 30%' }}>
                    <h1>Template naar design</h1>
                    <TextField fullWidth label="Naam" id="fullWidth" style={{ marginTop: "20px" }} onChange={e => setDesignName(e.target.value)} />
                    <Button variant="contained" style={{ marginTop: "20px" }} onClick={handleCustomerFormUploadTemplateToDesign}>Maak design</Button>
                    <Button variant="contained" color='error' style={{ marginTop: "20px", marginLeft: "20px" }} onClick={e => {
                        toggleEditorToDesign();
                    }}>Annuleer</Button>
                </Box>
            }
            <Grid ref={editorSectionRef} container style={{ overflow: "hidden"}}>
                <Grid item xs={2} style={{ height: "93.2vh" }}>
                    <Box
                        component={Grid}
                        container
                        boxShadow={3}
                        style={{ height: "inherit" }}
                    >
                        <Stack spacing={2} alignItems={"center"} style={{ width: "95%", margin: "20px 10px 0 10px" }}>
                            {
                                isAdminTemplateMode && (
                                    <label htmlFor="contained-button-file" style={{ width: "100%" }}>
                                        <Input
                                            id="contained-button-file"
                                            multiple
                                            webkitdirectory="true"
                                            directory="true"
                                            type="file"
                                            onChange={loadFilesHandler}
                                        />
                                        <Button variant="contained" component="span" style={{ width: "100%" }}>
                                            Laad export bestanden
                                        </Button>
                                    </label>
                                )
                            }
                            {
                                templateFiles.length > 1 &&
                                <>
                                    <Button variant="contained" component="span" onClick={() => setTemplatePos(templatePos + 1)} style={{ width: "100%" }}>
                                        Volgende
                                    </Button>
                                    <Button variant="contained" component="span" onClick={() => setTemplatePos(templatePos - 1)} style={{ width: "100%" }}>
                                        Vorige
                                    </Button>
                                </>
                            }
                            {
                                selectedElement !== null &&
                                <>
                                    <TextField
                                        id="templateEditorTextField"
                                        label="Type text"
                                        multiline
                                        rows={4}
                                        variant="filled"
                                        value={textFieldValue}
                                        onChange={handleTextChange}
                                        style={{ width: "100%" }}
                                        ref={textFieldRef}
                                        inputProps={{ maxLength: parseInt(selectedElement.dataset.textLimit) }}
                                    />
                                    <div>
                                        <Button variant="contained" style={{ textAlign: "center", padding: "0px", fontSize: "15px", marginRight: "10px" }}  onClick={() => { handleFontSizeUp();}}>
                                            A^
                                        </Button>
                                        <Button variant="contained" style={{ textAlign: "center", padding: "0px", fontSize: "15px" }} onClick={() => { handleFontSizeDown(); }}>
                                            a˅
                                        </Button>
                                    </div>
                                    <Button variant="contained" style={{ textAlign: "center" }} onClick={() => { setFotoLibView(!fotoLibView) }}>
                                        fotolib temp button
                                    </Button>
                                </>
                            }
                            {
                                selectedElement !== null && isAdminTemplateMode &&
                                <>
                                <FormControl style={{ width: "100%" }}>
                                    <InputLabel id="templateEditorSelectWrapLabel">Wrap</InputLabel>
                                    <Select
                                        id="templateEditorSelectWrap"
                                        labelId='templateEditorSelectWrapLabel'
                                        label="Wrap"
                                        value={textWrap}
                                        onChange={handleWrapping}
                                        ref={wrapOptionsRef}
                                    >
                                        <MenuItem value={"normal"}>Wrap</MenuItem>
                                        <MenuItem value={"nowrap"}>No wrap</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl style={{ width: "100%" }}>
                                    <InputLabel id="templateEditorSelectAlignLabel">Align</InputLabel>
                                    <Select
                                        id="templateEditorSelectAlign"
                                        labelId='templateEditorSelectAlignLabel'
                                        label="Align"
                                        value={textAlign}
                                        onChange={handleAlign}
                                        ref={alignOptionsRef}
                                    >
                                        <MenuItem value={"left"}>Left</MenuItem>
                                        <MenuItem value={"center"}>Center</MenuItem>
                                        <MenuItem value={"right"}>Right</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControlLabel
                                    label="Editable by customer"
                                    control={
                                        <Checkbox
                                            checked={isElementEditable}
                                            onChange={handleCheckboxEditable}
                                            ref={editableCheckboxRef}
                                        />
                                    }
                                />
                                </>
                            }
                            {
                                templateFiles.length > 0 && isAdminTemplateMode && 
                                <ActionButton text="Upload" confirmMessage="Weet u zeker dat u de template wilt uploaden?" />
                            }
                            {
                                templateFiles.length > 0 && isModerator() && isEmployee() && isTemplateMode && 
                                <ActionButton text="Maak design" confirmMessage="Weet u zeker dat u de template wilt goedkeuren?" />
                            }
                            {
                                templateFiles.length > 0 && isAdminDesignMode || (isModerator() && isDesignMode) && 
                                <ActionButton text="Valideer" confirmMessage="Weet u zeker dat u een design wilt maken?" />
                            }
                            <Button variant="contained" component="span" style={{ width: "100%", textAlign: "center" }} onClick={e => {
                                const confirmResult = window.confirm("Weet u zeker dat u terug wilt gaan? Uw veranderingen worden niet opgeslagen.");

                                if (confirmResult) {
                                    window.location = isAdmin() ? "/admin-portal" : "/user-portal";
                                }
                            }}>
                                Terug naar {isAdmin() ? "admin portaal" : "user portaal"}
                            </Button>
                        </Stack>
                    </Box>
                </Grid>
                <Grid item xs={true}>
                    {templateFiles.length > 0 && templatePos >= 0 && templatePos <= templateFiles.length - 1 && !fotoLibView ?
                        <iframe onLoad={handleTemplateLoad}
                            title="templateViewer"
                            srcDoc={templateFiles[templatePos]?.data}
                            style={{ height: "100%", width: "100%" }}
                            ref={editorFrameRef}
                        ></iframe>
                        : fotoLibView ?
                            mainPage(getPayloadAsJson()!.type === "Admin" ? props : queryParamsObject, imageList, getPayloadAsJson()!.type !== "Employee" ? true : false, setImageList, stylesFotoLib, true)
                            :
                        <div style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100vh",
                        }}>Geen template geselecteerd</div>
                    }
                </Grid>
            </Grid>
        </>
    )
}

export default CreateExport('/editor', TemplateEngine);
