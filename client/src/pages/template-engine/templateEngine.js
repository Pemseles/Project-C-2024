import './templateEngine.css';
import { useEffect, useState } from 'react';
import { CreateExport } from '../../helpers/Export';
import { readFile, readFileAsDataUrl } from '../../helpers/FileReader';
import { AppBar, Button, styled, Toolbar, Typography } from '@material-ui/core';

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

function TemplateEngine() {
    const [templatePos, setTemplatePos] = useState(0);
    const [exportFiles, setExportFiles] = useState(null);

    const [templateFiles, setTemplateFiles] = useState([]);

    useEffect(() => {
        if (exportFiles !== null && templateFiles.length === 0) {
            // Omdat het lezen van bestanden asynchrounous gaat, wrappen wij onze for loop in een async functie zodat wij
            // bij onze readFile statements een await keyword mee kunnen geven.
            // Dit zorgt ervoor dat alle promises worden voldaan in sync.

            // Needs some refinement in some areas (mainly lessen the amount of for loops if possible)
            (async function doPromises() {
                let files = {
                    html: [],
                    css: [],
                    images: [],
                };

                const createObj = (file, data) => {
                    return {
                        name: file.name,
                        data: data,
                    };
                };

                for (let i = 0; i < exportFiles.length; i++) {
                    const file = exportFiles[i];

                    if (file.type === 'text/html') {
                        files['html'].push(createObj(file, await readFile(file)));
                    } else if (file.type === 'text/css') {
                        files['css'].push(createObj(file, await readFile(file)));
                    } else if (['image/png', 'image/jpg', 'image/jpeg'].includes(file.type)) {
                        files['images'].push(createObj(file, await readFileAsDataUrl(file)));
                    }
                }

                for (let i = 0; i < files['html'].length; i++) {
                    const htmlObj = files['html'][i];

                    const htmlDoc = new DOMParser().parseFromString(htmlObj.data, 'text/html');

                    for (let i = 0; i < files['css'].length; i++) {
                        const node = document.createElement('style');
                        node.innerText = files['css'][i]['data'].replace(/\r?\n|\r/g, '');
                        htmlDoc.getElementsByTagName('head')[0].appendChild(node);
                    }

                    const imgTags = htmlDoc.getElementsByTagName('img');

                    for (let i = 0; i < imgTags.length; i++) {
                        const imgTag = imgTags[i];

                        const srcName = imgTag.src.split('/').at(-1);

                        const imgObj = files['images'].find((imgObj) => imgObj['name'] === srcName);

                        if (imgObj !== undefined) {
                            imgTag.src = imgObj['data'];
                        }
                    }

                    files['html'][i]['data'] = new XMLSerializer().serializeToString(htmlDoc);
                }

                setTemplateFiles(files['html']);
            })();
        } else {
            const el = document.getElementById('templateEngineFrame');

            if (el !== null) el.remove();

            if (
                templateFiles.length > 0 &&
                templatePos >= 0 &&
                templatePos <= templateFiles.length - 1
            ) {
                const wrapper = document.querySelector('.templateEngineWrapper');
                const frame = document.createElement('iframe');
                frame.id = 'templateEngineFrame';
                frame.style.display = 'block';
                frame.style.width = '595px';
                frame.style.height = '842px';
                frame.style.margin = '0 auto';
                wrapper.appendChild(frame);
                frame.contentDocument.write(templateFiles[templatePos]['data']);
            }
        }
    }, [templatePos, exportFiles, templateFiles]);

    return (
        <div className="templateEngineContainer">
            <label htmlFor="contained-button-file">
                <Input
                    id="contained-button-file"
                    multiple
                    webkitdirectory="true"
                    directory="true"
                    type="file"
                    onChange={(e) => {
                        setExportFiles(e.target.files);
                    }}
                />
                <Button variant="contained" component="span">
                    Load Export Files
                </Button>
            </label>
            {/* <div className="controls-wrapper">
                <button
                    className="previous"
                    onClick={() => setTemplatePos(templatePos - 1)}
                    style={buttonHandler('previous', templatePos, templateFiles)}
                >
                    Previous
                </button>
                <button
                    className="next"
                    onClick={() => setTemplatePos(templatePos + 1)}
                    style={buttonHandler('next', templatePos, templateFiles)}
                >
                    Next
                </button>
            </div>
            <div className="templateEngineWrapper"></div> */}
        </div>
    );
}

function buttonHandler(buttonName, templatePosition, templateFiles) {
    if (buttonName === 'previous') {
        if (templatePosition === 0) {
            return { display: 'none' };
        }
    } else {
        if (templatePosition === templateFiles.length - 1) {
            return { display: 'none' };
        }
    }
}

export default CreateExport('/template-editor', TemplateEngine);
