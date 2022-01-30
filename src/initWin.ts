import * as lib_sub from "./lib_sub";
import { Subtitle } from "subtitles-parser-vtt";

type Glob = {
    $dropAdd: HTMLElement,
    $dropAddBtn: HTMLElement,
    $selectSubtitles: HTMLSelectElement,
    $containerSoustitre: HTMLElement,
    $btnPlay: HTMLElement,
    $btnPause: HTMLElement,
    $inputTime: HTMLInputElement,
}

let g: Glob = null;
let g_filepath: string | null = null;
let g_subtitles: Subtitle[] | null = null;

console.log("test 2");
function initButton()
{
    g.$dropAdd.addEventListener("drop", (t) => {
        t.stopPropagation();
        t.preventDefault();
        if (t.dataTransfer) {
            addFiles(t.dataTransfer.files)
        }
        g.$dropAdd.classList.remove("hover")
    });

    g.$dropAdd.ondragenter = function(e) {
        g.$dropAdd.classList.add("hover")
    };

    g.$dropAdd.ondragleave = function(e) {
        g.$dropAdd.classList.remove("hover")
    }
    g.$dropAdd.addEventListener("dragover", (e) => {
        e.stopPropagation()
        e.preventDefault()
        if (e.dataTransfer)
            e.dataTransfer.dropEffect = "move";
    });
    g.$dropAddBtn.addEventListener("change", (t) => {
        t.stopPropagation(),
        t.preventDefault(),
        addFiles((t.target as any).files as FileList);
    });

    g.$selectSubtitles.onchange = function() {
        initSubtitleText(g.$selectSubtitles.value);
    }

    g.$btnPlay.onclick = musicPlay;
    g.$btnPause.onclick = musicPause;
}

async function initSelectSubtitle(filepath: string) {
    let soustitres = await lib_sub.getListeSubtitles(filepath) as { tags: { language: string; title: string }, index: string}[];
    g.$selectSubtitles.innerHTML = "";
    let first = true;
    for (const sub of soustitres) {
        let $option = document.createElement('option');
        $option.value = sub.index;
        $option.text = sub.tags.language + " - " + sub.tags.title + " - " + sub.index;
        g.$selectSubtitles.appendChild($option);
        if (first) {
            initSubtitleText(sub.index);
            first = false;
        }
    }
}

async function initSubtitleText(sub_id: string) {
    let subtitles = await lib_sub.getSubtitle(g_filepath, sub_id);
    g_subtitles = subtitles;
    console.log(subtitles);
    g.$containerSoustitre.innerHTML = "";
    for (const sub of subtitles) {
        let div = document.createElement('div'); div.classList.add("line");
        let divE = document.createElement('div'); divE.classList.add("date-end");
        let divS = document.createElement('div'); divS.classList.add("date-start");
        let divT = document.createElement('div'); divT.classList.add("text");
        div.appendChild(divS);
        div.appendChild(divE);
        div.appendChild(divT);
        div.id = "trad-" + sub.id;
        divE.innerText = sub.endTime.toString();
        divS.innerText = sub.startTime.toString();
        divT.innerText = lib_sub.cleanText(sub.text);
        g.$containerSoustitre.appendChild(div);
    }
}

let interval: NodeJS.Timeout | null = null;
let index_actuel: number = -1;
function musicPlay() {
    if (interval == null) {
        index_actuel = -1;
        interval = setInterval(bouclePlay, 100);
    }
}

function musicPause() {
    if (interval) {
        clearInterval(interval);
    }
    interval = null;
}

function bouclePlay() {
    let time = parseInt(g.$inputTime.value) + 100;
    g.$inputTime.value = (time).toString();
    

    if (g_subtitles) {
        let actuel = g_subtitles.find(sub => sub.id > index_actuel && time < sub.endTime && time >= sub.startTime);
        console.log(actuel, index_actuel, time);
        if (actuel) {
            Array.from(document.querySelectorAll('.line.active')).map(e => e.classList.remove('active'));
            Array.from(document.querySelectorAll('.line#trad-'+actuel.id)).map(e => {
                e.classList.add('active');
                e.scrollIntoView({
                    "block": "nearest",
                    "inline": "end",
                    "behavior": "smooth"
                })
            });
            lib_sub.readText(actuel, 1);
            index_actuel = actuel.id;
        }
    }
}

function addFiles(filelist: FileList) {
    let files = Array.from(filelist);
    let filepaths = files.map(file => file.path);
    if (filepaths.length > 0 && filepaths[0] != null && filepaths[0] != "") {
        g_filepath = filepaths[0];
        console.log(g_filepath);
        initSelectSubtitle(g_filepath);
    }
}

export async function start()
{
    document.getElementById('body').innerHTML = `
        <h1>ADKami TTS!</h1>
        <div class="drop blocm">
            <div id="drop-add" draggable="">Drop un mkv</div>
            <label for="drop-add-btn" class="btn">Selectionne un MKV</label>
            <input type="file" id="drop-add-btn" multiple="multiple">
        </div>

        <div class="container2">
            <div>
                <label>Choisir sous-titre: </label><select id="select-subtiltes"></select>
            </div>
            <div class="lecteur-video">
                <button id="btn-play">Play</button>
                <button id="btn-pause">Pause</button>
                <input type="text" enabled id="input-time" value="0">
            </div>
        
            <div id="container-soustitre">
        
            </div>
        </div
    `;

    g = {
        $dropAdd: document.getElementById("drop-add"),
        $dropAddBtn: document.getElementById("drop-add-btn"),
        $selectSubtitles: document.getElementById('select-subtiltes') as HTMLSelectElement,
        $containerSoustitre: document.getElementById('container-soustitre'),
        $btnPlay: document.getElementById('btn-play'),
        $btnPause: document.getElementById('btn-pause'),
        $inputTime: document.getElementById('input-time') as HTMLInputElement,
    };

    initButton();
}
