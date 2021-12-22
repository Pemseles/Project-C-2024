//// @ts-nocheck

import * as React from 'react';
import './user-portal.css';
import kyndalogo from './kynda.png';
import testimg1 from './testimg1.png';
import testimg2 from './testimg2.png';
import testimg3 from './testimg3.png';
import Enumerable from 'linq';
import { Design, Template, User } from '../../@types/general';
import { CreateExport } from '../../helpers/Export';
import {
    Typography,
    AppBar,
    Button,
    Card,
    CardContent,
    CardMedia,
    CssBaseline,
    Grid,
    Toolbar,
    Container,
    styled,
    Box,
    List,
    Drawer,
    IconButton,
    Divider,
    ListItem,
    MenuItem,
    Menu,
    Popover,
    TextField,
} from '@material-ui/core';
import {
    Settings,
    ChevronLeft,
    ChevronRight,
    PhotoCamera,
    Panorama,
    Brush,
    Menu as MenuIcon,
    AccountCircle,
    Info,
    Add,
    Home,
} from '@material-ui/icons';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useState, useEffect } from 'react';
import { getPayloadAsJson, getToken } from '../../helpers/Token';
import Api from '../../helpers/Api';
import { IPayload } from '../../@types/token';
//import Image from 'image-js';

const useStyles = makeStyles((theme) => ({
    icon: {
        marginRight: '20px',
    },
    cardGrid: {
        padding: '20px 0',
    },
    card: {
        width: '300px',
        height: '100%',
        position: 'relative',
    },
    cardMedia: {},
    cardContent: {
        flexGrow: 1,
    },
}));

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start',
}));

function UserPortal() {
    const theme = useTheme();
    const styles = useStyles();
    const [designList, setdesignList] = useState(Array<Design>());
    const [templateList, settemplateList] = useState(Array<Template>());
    const [designView, setDesignView] = useState(false);
    const [infoView, setInfoView] = useState(Array<boolean>());
    const [templateView, settemplateView] = useState(false);
    const [settingsView, setSettingsView] = useState(false);
    const [isModerator] = useState(getPayloadAsJson()!.type === 'Moderator' ? true : false);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [newPassInput, setNewPassInput] = useState('');
    const [confirmPassInput, setConfirmPassInput] = useState('');
    const [currentPassInput, setCurrentPassInput] = useState('');
    const [passErrorMsg, setPassErrorMsg] = useState(['', '', '']);
    const [headerMsg, setheaderMsg] = useState(['Home', 'pagina']);
    const [userList, setUserList] = useState(Array<User>());
    const [anchorEl, setAnchorEl] = useState(null);
    const [pass, setPass] = useState('');
    const openMenu = Boolean(anchorEl);
    const handleDrawerOpen = () => {
        setOpenDrawer(true);
        document.getElementById('AppBar')!.style.width = window.innerWidth - 280 + 'px';
        document.getElementById('userPortalMainPage')!.style.marginLeft = '280px';
    };

    const handleDrawerClose = () => {
        setOpenDrawer(false);
        document.getElementById('AppBar')!.style.width = window.innerWidth + 'px';
        document.getElementById('userPortalMainPage')!.style.marginLeft = '10px';
    };

    const handleClickMenu = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleInputChangeCurrentPass = (event: any) => {
        setCurrentPassInput(event.target.value);
    };

    const handleInputChangeNewPass = (event: any) => {
        setNewPassInput(event.target.value);
    };

    const handleInputChangeConfirmPass = (event: any) => {
        setConfirmPassInput(event.target.value);
    };

    useEffect(() => {
        (async () => {
            settemplateList(await getTemplates());
            setdesignList(await getDesigns());
            setInfoView(await makeInfoViewBoolList());

            const ApiInstance = new Api(getToken()!);

            setPass(await GetUserPassword(getPayloadAsJson()!));

            let userDataDb = [];

            if (typeof (userDataDb = await ApiInstance.all('user')) === 'undefined') {
                window.alert('De verbinding met de database is verbroken. Probeer het later opnieuw.');
                return;
            }

            const allUsers = User.makeUserArray(userDataDb.content);
            let usersOfCompany = new Array<User>();
            for (let userIndex = 0; userIndex < allUsers.length; userIndex++) {
                if (
                    allUsers[userIndex].Company_Id === getPayloadAsJson()!.company &&
                    allUsers[userIndex].Email !== getPayloadAsJson()!.email
                ) {
                    usersOfCompany.push(allUsers[userIndex]);
                }
            }
            setUserList(usersOfCompany);
        })();
    }, []);

    return (
        <React.Fragment>
            <CssBaseline />
            <Box sx={{ display: 'flex' }}>
                <AppBar position="fixed" style={{ background: 'white' }} id="AppBar">
                    <Toolbar>
                        <IconButton color={'primary'} onClick={openDrawer ? handleDrawerClose : handleDrawerOpen}>
                            <MenuIcon />
                        </IconButton>
                        <img src={kyndalogo} alt="kynda logo" width="90" height="30" style={{ marginRight: '20px', marginLeft: '20px' }} />
                        <Typography variant="h5" style={{ color: 'black', marginLeft: '6px' }}>
                            {headerMsg[0]}
                        </Typography>
                        <Typography variant="h5" style={{ color: 'black', marginLeft: '6px' }}>
                            {headerMsg[1]}
                        </Typography>
                        <Grid container spacing={2} justifyContent="flex-end">
                            <Grid item>
                                <Button variant="contained" color="primary"
                                    onClick={() => {
                                        document.cookie = document.cookie.substring(document.cookie.indexOf('token='), 6);
                                        window.location.replace('/');
                                    }}>
                                    Uitloggen
                                </Button>
                            </Grid>
                            <Grid item>
                                <Settings className={styles.icon} style={{ color: 'black', cursor: 'pointer' }} fontSize="large"
                                    onClick={handleClickMenu}
                                    aria-controls="basic-menu"
                                    aria-haspopup="true"
                                    aria-expanded={openMenu ? 'true' : undefined}
                                />
                                <Menu id="basic-menu" anchorEl={anchorEl} open={openMenu} onClose={handleCloseMenu} MenuListProps={
                                    {
                                        'aria-labelledby': 'basic-button',
                                    }}
                                    style={{ marginTop: '50px' }}>
                                    <MenuItem onClick={handleCloseMenu}>
                                        <AccountCircle style={{ fontSize: '110px', marginRight: '15px' }} />
                                        {getPayloadAsJson()!.naam}<br />{getPayloadAsJson()!.email}
                                    </MenuItem>
                                    <Divider />
                                    <MenuItem onClick={() => {
                                        handleCloseMenu();
                                        setheaderMsg(['Instellingen', '']);
                                        setSettingsView(true);
                                        window.scroll(0, 0);
                                    }}
                                        style={{ marginTop: '10px' }}>
                                        Accountgegevens wijzigen
                                    </MenuItem>
                                    <MenuItem onClick={() => {
                                        handleCloseMenu();
                                        setheaderMsg(['Instellingen', '']);
                                        setSettingsView(true);
                                        window.scroll(0, window.innerHeight / 2.5);
                                    }}
                                        style={{ marginTop: '10px' }}>
                                        Wachtwoord wijzigen
                                    </MenuItem>
                                    {isModerator ? (
                                        <MenuItem onClick={() => {
                                            handleCloseMenu();
                                            setheaderMsg(['Instellingen', '']);
                                            setSettingsView(true);
                                            window.scroll(0, window.innerHeight / 1);
                                        }}
                                            style={{ marginTop: '10px' }}>
                                            Hoofdgebruikeraccount wijzigen
                                        </MenuItem>
                                    ) : ''}
                                </Menu>
                            </Grid>
                        </Grid>
                    </Toolbar>
                </AppBar>
                <Drawer id="Drawer"
                    variant="persistent"
                    anchor="left"
                    open={openDrawer}>
                    <DrawerHeader>
                        <IconButton onClick={handleDrawerClose}>
                            {theme.direction === 'rtl' ? <ChevronRight /> : <ChevronLeft />}
                        </IconButton>
                    </DrawerHeader>
                    <Divider />
                    <List>
                        {designView || templateView || settingsView ? <><ListItem className="listItemButton" onClick={() => {
                            setDesignView(false);
                            settemplateView(false);
                            setSettingsView(false);
                            setheaderMsg(['Home', 'pagina']);
                            handleDrawerClose();
                        }}>
                            <Home style={{ marginRight: '20px' }}></Home>
                            <Typography variant="h5">Home pagina</Typography>
                        </ListItem><Divider /></> : ''}
                        <ListItem className="listItemButton" onClick={() => { window.open('/fotogalerij', '_blank')!.focus(); }}>
                            <PhotoCamera style={{ marginRight: '20px' }}></PhotoCamera>
                            <Typography variant="h5">Fotogalerij</Typography>
                        </ListItem>
                        {designView ? <ListItem className="listItemButton" onClick={() => {
                            setDesignView(!designView);
                            settemplateView(false);
                            setheaderMsg(['Alle', 'designs']);
                            handleDrawerClose();
                        }}
                            style={{ backgroundColor: 'lightgray' }}>
                            <Brush style={{ marginRight: '20px' }}></Brush>
                            <Typography variant="h5">Alle designs</Typography>
                        </ListItem> : <ListItem className="listItemButton" onClick={() => {
                            setDesignView(!designView);
                            settemplateView(false);
                            setheaderMsg(['Alle', 'designs']);
                            handleDrawerClose();
                        }}>
                            <Brush style={{ marginRight: '20px' }}></Brush>
                            <Typography variant="h5">Alle designs</Typography>
                        </ListItem>}
                        {templateView ? <ListItem className="listItemButton" onClick={() => {
                            setDesignView(false);
                            settemplateView(!templateView);
                            setheaderMsg(['Alle', 'templates']);
                            handleDrawerClose();
                        }}
                            style={{ backgroundColor: 'lightgray' }}>
                            <Panorama style={{ marginRight: '20px' }}></Panorama>
                            <Typography variant="h5">Alle templates</Typography>
                        </ListItem> : <ListItem className="listItemButton" onClick={() => {
                            setDesignView(false);
                            settemplateView(!templateView);
                            setheaderMsg(['Alle', 'templates']);
                            handleDrawerClose();
                        }}>
                            <Panorama style={{ marginRight: '20px' }}></Panorama>
                            <Typography variant="h5">Alle templates</Typography>
                        </ListItem>}
                    </List>
                    <Divider />
                    <List>
                        <ListItem>
                            <Typography style={{ fontSize: '14px' }}>
                                Kynda contactgegevens:<br />Goudsesingel 156 | 3011 KD Rotterdam<br />+31 (0) 10 3075454
                            </Typography>
                        </ListItem>
                        <ListItem>
                            <Typography style={{ fontSize: '14px' }}>
                                Hoofdgebruiker contactgegevens:<br />Schilderswijk 55 | 2111 FD DenHaag<br />+31 (0) 12 3456789
                            </Typography>
                        </ListItem>
                    </List>
                </Drawer>
            </Box>
            <div style={{ marginTop: '70px' }} id="userPortalMainPage" onClick={handleDrawerClose}>
                {!settingsView ? <Container maxWidth="md" className={styles.cardGrid}>
                    <Grid container spacing={4}>
                        {typeof designList !== 'undefined' && !templateView
                            ? designList.map((design, index) => {
                                if (index < 5 || designView) {
                                    return (
                                        <Grid item xs={12} sm={3} md={4} key={index}>
                                            <Card className={styles.card}>
                                                <CardMedia className={styles.cardMedia} title={'test'}>
                                                    <img id="testimg" src={testimg2} style={{ width: '300px', }} />
                                                </CardMedia>
                                                {!infoView[index] ? (
                                                    <Button style={{
                                                        position: 'absolute',
                                                        top: '5px',
                                                        left: '5px',
                                                        background: 'rgb(63, 81, 181)',
                                                    }}
                                                        onClick={() => {
                                                            setInfoView(
                                                                makeNewInfoViewBoolList(
                                                                    index,
                                                                    designList,
                                                                    infoView
                                                                )
                                                            );
                                                        }}>
                                                        <Info style={{ color: 'white' }} />
                                                    </Button>
                                                ) : (
                                                    <List style={{
                                                        position: 'absolute',
                                                        top: '0px',
                                                        left: '0px',
                                                        background: 'white',
                                                        color: 'black',
                                                        height: '80%',
                                                    }}
                                                        onClick={() => {
                                                            setInfoView(
                                                                makeNewInfoViewBoolList(
                                                                    index,
                                                                    designList,
                                                                    infoView
                                                                )
                                                            );
                                                        }}>
                                                        <ListItem style={{
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '20px',
                                                        }}>
                                                            Gegevens
                                                        </ListItem>
                                                        <Divider />
                                                        <ListItem style={{
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}>
                                                            {'Naam: ' + design.Name}
                                                        </ListItem>
                                                        <ListItem style={{
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}>
                                                            {'Template naam: ' + Enumerable.from(templateList).where((t) => t.Id === design.Template_id)
                                                                .select((t) => t.Name).toArray()[0]}
                                                        </ListItem>
                                                        <ListItem style={{
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}>
                                                            {'Gemaakt op: ' + design.Created_at.toLocaleDateString()}
                                                        </ListItem>
                                                        <ListItem style={{
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}>
                                                            {'Laadst bijgewerkt: ' + (design.Updated_at.toString() === 'Invalid Date' ? 'nooit' : design.Updated_at.toLocaleDateString())}
                                                        </ListItem>
                                                        <ListItem style={{
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}>
                                                            {'Gevalideerd: ' + (!design.Verified ? 'nee' : 'ja')}
                                                        </ListItem>
                                                    </List>
                                                )}
                                                <CardContent className={styles.cardContent}>
                                                    <Typography gutterBottom variant="h6" align="center">
                                                        {design.Name} <br />
                                                        {!design.Verified && isModerator ?
                                                            <Button variant="contained" color="primary" onClick={async () => { await onValidateButtonClick(design, setdesignList) }}>
                                                                Valideren
                                                            </Button> : !design.Verified ?
                                                                <Button variant="contained" color="primary">
                                                                    Bewerken
                                                                </Button> : <Button variant="contained" color="primary">
                                                                    Downloaden
                                                                </Button>
                                                        }
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    );
                                }
                            })
                            : templateView
                                ? templateList.map((template, index) => {
                                    return (
                                        <Grid item xs={12} sm={3} md={4} key={index}>
                                            <Card className={styles.card}>
                                                <CardMedia
                                                    className={styles.cardMedia}
                                                    title={'test'}
                                                >
                                                    <img
                                                        id="testimg"
                                                        src={testimg3}
                                                        style={{ width: '300px' }}
                                                    />
                                                </CardMedia>
                                                <CardContent className={styles.cardContent}>
                                                    <Typography
                                                        gutterBottom
                                                        variant="h6"
                                                        align="center"
                                                    >
                                                        {'test template card: ' + (index + 1)}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    );
                                })
                                : ''}
                        {!templateView ? (
                            <Grid item xs={12} sm={3} md={4} key={6}>
                                <Card className={styles.card}>
                                    <CardMedia className={styles.cardMedia} title={'test'}>
                                        <img
                                            id="testimg"
                                            src={testimg1}
                                            style={{ width: '300px' }}
                                        />
                                    </CardMedia>
                                    <Button
                                        style={{
                                            position: 'absolute',
                                            top: '210px',
                                            left: '110px',
                                            background: 'rgb(63, 81, 181)',
                                        }}
                                        onClick={() => {
                                            window.open('/template-editor', '_blank')!.focus();
                                        }}
                                    >
                                        <Add style={{ color: 'white' }} />
                                    </Button>
                                    <CardContent className={styles.cardContent}>
                                        <Typography gutterBottom variant="h6" align="center">
                                            {'Nieuwe design toevoegen'}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ) : (
                            ''
                        )}
                    </Grid>
                </Container> : <Box
                    sx={{
                        display: 'flex',
                        marginTop: '70px',
                        alignItems: 'center',
                        flexDirection: 'column',
                    }}
                    id="userPortalSettingsPage">
                    <List>
                        <ListItem style={{ paddingLeft: '200px', paddingRight: '200px' }}>
                            <AccountCircle style={{ fontSize: '170px', marginRight: '15px' }} />
                            <Typography variant="h6">
                                {getPayloadAsJson()!.naam}
                                <br />
                                {getPayloadAsJson()!.email}
                            </Typography>
                        </ListItem>
                        <Divider />
                    </List>
                    <List>
                        <ListItem
                            style={{ paddingTop: '50px', paddingBottom: '20px', paddingLeft: '200px', paddingRight: '200px' }}
                        >
                            <Typography variant="h6">
                                {'Naam: '} &emsp;&emsp;&emsp;&nbsp;
                                {getPayloadAsJson()!.naam}
                            </Typography>
                        </ListItem>
                        <ListItem style={{ paddingBottom: '50px', paddingLeft: '200px', paddingRight: '200px' }}>
                            <Typography variant="h6">
                                {'E-mail: '} &emsp;&emsp;&emsp;
                                {getPayloadAsJson()!.email}
                            </Typography>
                        </ListItem>
                        <Divider />
                        <ListItem style={{ paddingTop: '50px', paddingLeft: '200px', paddingRight: '200px' }}>
                            <Typography variant="h6">
                                {'Huidig wachtwoord: '} &emsp;&emsp;&emsp;
                                <TextField required error={passErrorMsg[0] !== ''} helperText={passErrorMsg[0]} type={'password'} value={currentPassInput} onChange={handleInputChangeCurrentPass} />
                            </Typography>
                        </ListItem>
                        <ListItem style={{ paddingTop: '50px', paddingLeft: '200px', paddingRight: '200px' }}>
                            <Typography variant="h6">{'Nieuw wachtwoord: '} &emsp;&emsp;&emsp;</Typography>
                            <TextField required error={passErrorMsg[1] !== ''} helperText={passErrorMsg[1]} type={'password'} value={newPassInput} onChange={handleInputChangeNewPass} />
                        </ListItem>
                        <ListItem style={{ paddingTop: '50px', paddingLeft: '200px', paddingRight: '200px' }}>
                            <Typography variant="h6">{'Bevestig wachtwoord: '} &emsp;&emsp;</Typography>
                            <TextField id="confirmPass" required error={passErrorMsg[2] !== ''} helperText={passErrorMsg[2]} type={'password'} value={confirmPassInput} onChange={handleInputChangeConfirmPass} />
                        </ListItem>
                        <Typography
                            align="center"
                            style={{ paddingTop: '50px', paddingBottom: '50px', paddingLeft: '200px', paddingRight: '200px' }}
                        >
                            <Button variant="contained" color="primary" onClick={() => {
                                ChangePass(getPayloadAsJson()!.sub, pass, currentPassInput, newPassInput, confirmPassInput, setPassErrorMsg);
                            }}>
                                Toepassen
                            </Button>
                        </Typography>
                        <Divider />
                    </List>
                    <List>
                        {getPayloadAsJson()!.type === 'Moderator' ? <ListItem style={{ alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                            <Typography variant="h6">
                                Hieronder kunt u een gebruiker selecteren om hoofdgebruiker te maken.<br />
                                Er kan maar een hoofdgebruiker zijn. Dit betekent dat <br />het huidige hoofdgebruiker account een normale gebruiker wordt.
                            </Typography>
                        </ListItem> : ''}
                        {getPayloadAsJson()!.type === 'Moderator'
                            ? userList.map((user, index) => {
                                if (index % 2 === 0) {
                                    return (
                                        <><ListItem style={{ alignItems: 'center', justifyContent: 'center', marginRight: '50px' }}>
                                            <><ListItem id={'userField' + index} style={{ alignItems: 'center', width: '50%' }}
                                                onMouseEnter={() => userOnHover(index)}
                                                onMouseLeave={() => userLeave(index)}>
                                                <AccountCircle style={{ fontSize: '60px', marginRight: '15px' }} />
                                                <Typography variant="h6">
                                                    {userList[index].Name}
                                                    <br />
                                                    {userList[index].Email}
                                                </Typography>
                                            </ListItem>{index === userList.length - 1 && userList.length % 2 !== 0 ? <Button
                                                variant="contained"
                                                color="primary"
                                                style={{
                                                    position: 'absolute',
                                                    top: '30px',
                                                    left: '275px',
                                                    opacity: 0
                                                }}
                                                id={'userButton' + index}
                                                onMouseEnter={() => userOnHover(index)}
                                                onMouseLeave={() => userLeave(index)}
                                                onClick={() => onMakeMainUserButtonClick(user, getPayloadAsJson()!.sub)}
                                            >
                                                Maak hoofdgebruiker
                                            </Button> : <Button
                                                variant="contained"
                                                color="primary"
                                                style={{
                                                    position: 'absolute',
                                                    top: '30px',
                                                    left: '100px',
                                                    opacity: 0
                                                }}
                                                id={'userButton' + index}
                                                onMouseEnter={() => userOnHover(index)}
                                                onMouseLeave={() => userLeave(index)}
                                                onClick={() => onMakeMainUserButtonClick(user, getPayloadAsJson()!.sub)}
                                            >
                                                Maak hoofdgebruiker
                                            </Button>}</>
                                            {index + 1 < userList.length ? <><ListItem id={'userField' + (index + 1)} style={{ alignItems: 'center', marginLeft: '50px', width: '50%' }}
                                                onMouseEnter={() => userOnHover(index + 1)}
                                                onMouseLeave={() => userLeave(index + 1)}>
                                                <AccountCircle style={{ fontSize: '60px', marginRight: '15px' }} />
                                                <Typography variant="h6">
                                                    {userList[index + 1].Name}
                                                    <br />
                                                    {userList[index + 1].Email}
                                                </Typography>
                                            </ListItem><Button
                                                variant="contained"
                                                color="primary"
                                                style={{
                                                    position: 'absolute',
                                                    top: '30px',
                                                    left: '477px',
                                                    opacity: 0
                                                }}
                                                id={'userButton' + (index + 1)}
                                                onMouseEnter={() => userOnHover(index + 1)}
                                                onMouseLeave={() => userLeave(index + 1)}
                                                onClick={() => onMakeMainUserButtonClick(userList[index + 1], getPayloadAsJson()!.sub)}
                                            >
                                                    Maak hoofdgebruiker
                                                </Button></> : ''}

                                        </ListItem><Divider /></>
                                    );
                                }
                            })
                            : ''}
                    </List>
                    <Typography variant="h6">
                        Gebruiker toevoegen:
                    </Typography>
                    <List>
                        <ListItem>
                            <AccountCircle style={{ fontSize: '100px', marginRight: '15px' }} />
                            <div style={{ fontSize: '20px' }}>Naam: &emsp;&emsp;&emsp;&emsp;&emsp;<TextField required /><br />
                                Email: &emsp;&emsp;&emsp;&emsp;&emsp;<TextField required /><br />
                                Wachtwoord: &emsp;&emsp;<TextField required />
                            </div>
                        </ListItem>
                    </List>
                </Box>}
            </div>
        </React.Fragment>
    );
}

async function getDesigns() {
    const ApiInstance = new Api(getToken()!);
    let designListDb = [];
    let templateListDb = [];
    if (typeof (designListDb = await ApiInstance.all('design')) === 'undefined') {
        window.alert('De verbinding met de database is verbroken. Probeer het later opnieuw.');
        return new Array<Design>();
    }

    //const designListAll = Design.makeDesignArray(designListDb.content);

    if (typeof (templateListDb = await ApiInstance.all('template')) === 'undefined') {
        window.alert('De verbinding met de database is verbroken. Probeer het later opnieuw.');
        return new Array<Design>();
    }
    
    const templateIdList = Enumerable.from(Template.makeTemplateArray(templateListDb.content))
        .where((t) => t.Company_id === getPayloadAsJson()!.company)
        .select((i) => i.Id)
        .toArray();
    const designList = Enumerable.from(Design.makeDesignArray(designListDb.content))
        .where((d) => Enumerable.from(templateIdList).contains(d.Template_id))
        .orderBy((d) => d.Template_id)
        .toArray();

    return designList;
}

async function getTemplates() {
    const ApiInstance = new Api(getToken()!);
    const user = getPayloadAsJson()!;
    let templateListDb = [];
    if (typeof (templateListDb = await ApiInstance.all('template')) === 'undefined') {
        window.alert('De verbinding met de database is verbroken. Probeer het later opnieuw.');
        return new Array<Template>();
    }

    let templateList = Enumerable.from(Template.makeTemplateArray(templateListDb.content))
        .where((t) => t.Company_id === user.company)
        .toArray();

    return templateList;
}

async function makeInfoViewBoolList() {
    const designList = await getDesigns();
    if (typeof designList === 'undefined') return new Array<boolean>();
    const boolList = [];
    for (var a = 0; a < designList.length; a++) {
        boolList.push(false);
    }

    return boolList;
}

async function onValidateButtonClick(design: Design, setdesignList: any) {
    const ApiInstance = new Api(getToken()!);
    let result = [];

    if (typeof (result = await ApiInstance.update('design', design.Id, [
        design.Filepath,
        design.Created_at.toLocaleDateString(),
        design.Updated_at.toLocaleDateString(),
        design.Downloads.toString(),
        '1',
        design.Template_id.toString(),
        design.Name,
    ])) === undefined) {
        window.alert(
            'De verbinding met de database is verbroken. Probeer het later opnieuw.'
        );
        return;
    };

    setdesignList(await getDesigns());
}

async function onMakeMainUserButtonClick(user: User, currentUserId: number) {
    const ApiInstance = new Api(getToken()!);
    let userDataDb = [];
    if (typeof (userDataDb = await ApiInstance.read('user', currentUserId)) === 'undefined' || userDataDb.status === 'FAIL') {
        window.alert('De verbinding met de database is verbroken. Probeer het later opnieuw.');
        return;
    }

    let result = [];
    if (typeof (result = await ApiInstance.update('user', currentUserId,
        [
            userDataDb.content[0].Email,
            userDataDb.content[0].Password,
            3,
            userDataDb.content[0].Name,
            userDataDb.content[0].Company_Id
        ])) === 'undefined') {
        window.alert(
            'De verbinding met de database is verbroken. Probeer het later opnieuw.'
        );
        return;
    }

    if (typeof (result = await ApiInstance.update('user', user.Id,
        [
            user.Email,
            user.Password,
            '2',
            user.Name,
            user.Company_Id.toString()
        ])) === 'undefined') {
        window.alert(
            'De verbinding met de database is verbroken. Probeer het later opnieuw.'
        );
        return;
    }

    document.cookie = document.cookie.substring(document.cookie.indexOf('token='), 6);
    window.location.replace('/');
}

async function GetUserPassword(userInstance: IPayload) {
    let userDataDb = [];
    const ApiInstance = new Api(getToken()!);
    if (typeof (userDataDb = await ApiInstance.read('user', userInstance.sub)) === 'undefined') {
        window.alert('De verbinding met de database is verbroken. Probeer het later opnieuw.');
        return;
    }
    return userDataDb.content[0].Password;
}

function makeNewInfoViewBoolList(index: number, designList: Array<Design>, infoView: Array<Boolean>) {
    const boolList = [];
    for (var a = 0; a < designList.length; a++) {
        if (a === index) {
            boolList.push(!infoView[index]);
            continue;
        }
        boolList.push(false);
    }

    return boolList;
}

function userOnHover(id: number) {
    const userField = 'userField' + id;
    const userButtonId = 'userButton' + id;
    document.getElementById(userField)!.style.filter = 'blur(4px)';
    document.getElementById(userField)!.style.transition = '1s';
    document.getElementById(userButtonId)!.style.transition = '1s';
    document.getElementById(userButtonId)!.style.opacity = '1';
    document.getElementById(userButtonId)!.style.top =
        String(parseInt(document.getElementById(userField)!.style.height) / 1.5) + 'px';
    document.getElementById(userButtonId)!.style.left =
        String(parseInt(document.getElementById(userField)!.style.height) / 7) + 'px';
}

function userLeave(id: number) {
    const userField = 'userField' + id;
    const userButtonId = 'userButton' + id;
    document.getElementById(userField)!.style.filter = 'none';
    document.getElementById(userButtonId)!.style.opacity = '0';
}

async function ChangePass(userId: number, userPassword: string, currentPass: string, newPass: string, confirmPass: string, setPassError: any) {
    setPassError([
        currentPass === '' ? 'Dit veld is verplicht' : currentPass !== userPassword ? 'Het wachtwoord is onjuist' : '',
        newPass === '' ? 'Dit veld is verplicht' : '',
        confirmPass === '' ? 'Dit veld is verplicht' : newPass === '' ? 'U heeft geen nieuw wachtwoord opgegeven' : newPass !== confirmPass ? 'Wachtwoorden zijn ongelijk' : ''
    ]);

    // check for password format; minimaal 8 tekens, 1+ hoofdletter, 1+ cijfer & 1+ speciaal teken
    if (newPass !== confirmPass || currentPass !== userPassword) return;

    if (['!', '@', '#', '$', '%', '^', '&', ' *', '(', ')', '-', '_', '=', '+', '[', ']', '{', '}', `|`, ';', ':', "'", '"', ',', '<', '.', '>', '/', '?', '`', '~'].some(s => newPass.includes(s)) &&
        ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].some(s => newPass.includes(s)) && newPass.length > 7) {
        const ApiInstance = new Api(getToken()!);
        let userDataDb = [];
        if (typeof (userDataDb = await ApiInstance.read('user', userId)) === 'undefined') {
            window.alert('De verbinding met de database is verbroken. Probeer het later opnieuw.');
            return;
        }
        let result = [];
        if (typeof (result = await ApiInstance.update('user', userId,
            [
                userDataDb.content[0].Email,
                newPass,
                userDataDb.content[0].Role_Id,
                userDataDb.content[0].Name,
                userDataDb.content[0].Company_Id
            ])) === 'undefined') {
            window.alert(
                'De verbinding met de database is verbroken. Probeer het later opnieuw.'
            );
            return;
        }
    }
    else {
        setPassError(['',
            'Het wachtwoord voldoet niet aan de minimale eisen.',
            'Het wachtwoord voldoet niet aan de minimale eisen.'
        ]);
    }

}

export default CreateExport('/user-portal', UserPortal);