import * as exec from "./exec";
import parserSub from "subtitles-parser-vtt";
import pathFs from "path";
import fs from "fs";
import { convert } from 'html-to-text';

export async function getListeSubtitles(filepath: string) {
    let filename = pathFs.basename(filepath);
	let dirname = pathFs.dirname(filepath);

    let fichier_json = await exec.commande(__dirname +"/../bin/ffprobe", ["-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", filename], { cwd: dirname, verbose: true })
    let info = JSON.parse(fichier_json);
    const soustitres = info.streams.filter((a: any) => a.codec_type == 'subtitle');
    return soustitres;
}

export async function getSubtitle(filepath: string, sub_id: string) : Promise<parserSub.Subtitle[]>
{
    let filename = pathFs.basename(filepath);
	let dirname = pathFs.dirname(filepath);
    
    console.log(__dirname);
    let val = await exec.commande(__dirname +"/../bin/ffmpeg", ["-y", "-i", filename, "-map", "0:"+sub_id, __dirname + "/tmp.srt"], { cwd: dirname, verbose: true });
    console.log(val)
    let data = parserSub.fromVtt(await fs.promises.readFile(__dirname + '/tmp.srt','utf8'), "ms");
    return data;
}

export async function readText(data: parserSub.Subtitle, volume: number = 1.0) {
    const text = cleanText(data.text);
    var utter = new SpeechSynthesisUtterance();
    utter.text = text;
    utter.rate = 2;
    utter.onend = function(event) { console.log('Speech complete'); }
    speechSynthesis.speak(utter);
}

export function cleanText(txt: string) {
    return convert(txt).replace(/\{.*\}/gi, '');
}
