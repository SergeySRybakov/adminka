import "../../helpers/iframeLoader.js";
import axios from 'axios';
import React, {Component} from 'react';
import DOMHelper from "../../helpers/dom-helper.js";
import EditorText from "../editor-text/editor-text.js";
import Spinner from "../spinner/spinner.js";

export default class Editor extends Component {
    constructor() {
        super();
        this.currentPage = "index.html";
        this.state = {
            pageList: [],
            backupsList: [],
            newPageName: "",
            loading: true,
            meta : {
                title: '',
                keywords: '',
                description: ''
            }
        }
        this.isLoading = this.isLoading.bind(this);
        this.isLoaded = this.isLoaded.bind(this);
        this.save = this.save.bind(this);
        this.modalSave = this.modalSave.bind(this);
        this.modalPageList = this.modalPageList.bind(this);
        this.init = this.init.bind(this);
        this.restoreBackup = this.restoreBackup.bind(this);
        
    }

    componentDidMount() {
        this.init(null, this.currentPage);
    }

    init(e, page) {
        if (e) {
            e.preventDefault();
        }
        this.isLoading();
        this.iframe = document.querySelector('iframe');
        this.open(page, this.isLoaded);
        this.loadPageList();
        this.loadBackupsList();
    }

    open(page, cb) {
        this.currentPage = page;

        axios
            .get(`../${page}?rnd=${Math.random()}`)
            .then(res => DOMHelper.parseStrToDOM(res.data))
            .then(DOMHelper.wrapTextNodes)
            .then(dom => {
                this.virtualDom = dom;
                return dom;
            })
            .then(DOMHelper.serializeDOMToString)
            .then(html => axios.post("./api/saveTempPage.php", {html}))
            .then(() => this.iframe.load("../temppofkgpkfgpfk.html"))
            .then(() => axios.post("./api/deleteTempPage.php"))
            .then(() => this.enableEditing())
            .then(() => this.injectStyles())
            .then(cb);
        
        this.loadBackupsList();
    }

    async save() {
        this.isLoading();
        const newDom = this.virtualDom.cloneNode(this.virtualDom);
        DOMHelper.unwrapTextNodes(newDom);
        const html = DOMHelper.serializeDOMToString(newDom);
        await axios
            .post("./api/savePage.php", {pageName: this.currentPage, html})
            .finally(this.isLoaded);

        this.loadBackupsList();
    }

    enableEditing() {
        this.iframe.contentDocument.body.querySelectorAll("text-editor").forEach(element => {
            const id = element.getAttribute("nodeid");
            const virtualElement = this.virtualDom.body.querySelector(`[nodeid="${id}"]`)

            new EditorText(element, virtualElement);
        });
    }

    injectStyles() {
        const style = this.iframe.contentDocument.createElement("style");
        style.innerHTML = `
            text-editor:hover {
                outline: 3px solid orange;
                outline-offset: 8px;
            }
            text-editor:focus {
                outline: 3px solid red;
                outline-offset: 8px;
            }
        `;
        this.iframe.contentDocument.head.appendChild(style);
    }

    loadPageList() {
        axios
            .get("./api/pageList.php")
            .then(res => this.setState({pageList: res.data}))
    }

    loadBackupsList() {
        axios
            .get("./backups/backups.json")
            .then(res => this.setState({backupsList: res.data.filter(backup => {
                return backup.page === this.currentPage;
            })}))
    }

    restoreBackup(e, backup) {
        if (e) {
            e.preventDefault();
        }
        
        function confirmDialog(msg) {
            return new Promise(function (resolve, reject) {
              let confirmed = window.confirm(msg);
          
              return confirmed ? resolve(true) : reject(false);
            });
        }

        confirmDialog('If You load recovering, your not saved progress will be deleted. Are you want tomload recovering?')
            .then(() => {
                console.log("restoring");
                this.isLoading()
                return axios
                    .post('./api/restoreBackup.php', {"page": this.currentPage, "file": backup})
            })
            .then(() => {
                this.open(this.currentPage, this.isLoaded);
            })

    }

    isLoading() {
        this.setState({
            loading: true
        })
    }

    isLoaded() {
        this.setState({
            loading: false
        })
    }

    modalSave() {
        const modalFirst = document.querySelectorAll(".modal")[0];
        return (
            <>
                <button className='btnbtn' onClick={() => {
                    modalFirst.classList.remove("modal-hidden");
                }}>Save editings</button>
                <div className={"modal modal-hidden"}>
                    <div>rogik0rifgf gjvbodfkg bopvpfdoij</div>
                    <div className="doip">
                        <button className={"btn-modal"} onClick={() => {this.save()}}>Confirm editings</button>
                        <button className={"btn-modal"} onClick={() => {
                            modalFirst.classList.add("modal-hidden");
                            }}>Cancel</button>
                    </div>
                </div>
            </>
        )
    }

    modalPageList() {
        const pageList = this.state.pageList.map(item => {
            return (
                <li key={item}>
                    <a href="#" onClick={(e) => {
                        this.init(e, item);
                        document.querySelectorAll(".modal")[1].classList.add("modal-hidden")
                    }}>{item}</a>
                </li>
            )
        })
        return (
            <>
                <button className='btnbtn' onClick={(e) => {
                    document.querySelectorAll(".modal")[1].classList.remove("modal-hidden");
                }}>Pages</button>
                <div className={"modal modal-hidden"}>
                    <ul>
                        {pageList}
                    </ul>
                    <div className="doip">
                        <button className={"btn-modal"} onClick={(e) => {
                        document.querySelectorAll(".modal")[1].classList.add("modal-hidden")
                        }}>Cancel</button>
                    </div>
                </div>
            </>
        )
    }

    recover() {
        const recoveringList = this.state.backupsList.map(item => {
            let msg;
            if (item.lenght < 1) {
                msg = <div>Copy not found</div>
            } else {
                msg = "";
            }
            if (item.time) {
                return (
                    <li key={item.file}>
                        <a href="#" onClick={(e) => {
                            this.restoreBackup(e, item.file);
                            document.querySelectorAll(".modal")[2].classList.add("modal-hidden")
                        }}>Copy by {item.time} {msg}</a>
                    </li>
                )
            } else {
                return (
                    {/* <li key={item}>
                        <a href="#" onClick={(e) => {
                            this.init(e, item);
                            document.querySelectorAll(".modal")[2].classList.add("modal-hidden")
                        }}>{msg}</a>
                    </li> */}
                )
            }
            
        })
        return(
            <>
                <button className='btnbtn' onClick={(e) => {
                    document.querySelectorAll(".modal")[2].classList.remove("modal-hidden");
                }}>Recovering</button>
                <div className={"modal modal-hidden"}>
                    <ul>
                        {recoveringList}
                    </ul>
                    <div className="doip">
                        <button className={"btn-modal"} onClick={(e) => {
                        document.querySelectorAll(".modal")[2].classList.add("modal-hidden")
                        }}>Cancel</button>
                    </div>
                </div>
            </>
        )
    }

    /* componentDidMount() {
        this.getMeta(this.virtualDom);
    }

    getMeta(virtualDomen) {
        console.log(this.virtualDom.head.querySelector('title'));
        let title = virtualDomen.head.querySelector('title') || virtualDomen.head.appendChild(virtualDom.createElement('title'));
        console.log(title); 

        this.setState({
            meta: {
                title: this.virtualDom.head.querySelector('title').innerHTML
            }
        });
    } */

    editMeta() {
        console.log(this.virtualDom);
        console.log(this.virtualDom.head.querySelector('title'));

        const {title, keywords, description} = this.state.meta;

        return(
            <>
                <button className='btnbtn' onClick={(e) => {
                    document.querySelectorAll(".modal")[3].classList.remove("modal-hidden");
                }}>Edit META</button>
                <div className={"modal modal-hidden"}>
                    <form className="doip">
                        <div>
                            <input type={"text"} value={this.state.meta.title} readOnly />
                        </div>
                        <div>
                            <textarea rows={"5"} placeholder="Keywords"></textarea>
                        </div>
                        <div>
                            <textarea rows={"5"} placeholder="Description"></textarea>
                        </div>
                    </form>
                    <div className="doip">
                        <button className={"btn-modal"} onClick={() => {}}>Edit</button>
                        <button className={"btn-modal"} onClick={(e) => {
                        document.querySelectorAll(".modal")[3].classList.add("modal-hidden")
                        }}>Cancel</button>
                    </div>
                </div>
            </>
        )
    }

    render() {
        const {loading, pageList, backupsList} = this.state;
        let spinner;

        loading ? spinner = <Spinner active/> : spinner = <Spinner />;

        /* btn = <ChooseModal />; */

        return (
            <>
            <iframe src="" frameBorder="0"></iframe>

            {spinner}
            
                {this.modalSave()}

                {this.modalPageList()}

                {this.recover()}

                { this.virtualDom ? this.editMeta() : false }
            
            </>
        )
    }
}