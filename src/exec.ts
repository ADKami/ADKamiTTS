import { spawn } from 'child_process';


export function commande(cmd: string, argc: string[], option: any = null) : Promise<string> {
	option = option || {};
	if (option.verbose) {
		console.log(argc);
	}
	return new Promise((res) => {
		const exe = spawn(cmd, argc, option);
		let dataOut = "";

		function outData(data: any) {
			if (option.progress == true) {
				if (option.verbose) console.log(`${data}`);
			} else {
				dataOut += data;
			}
		}

		exe.stdout.on('data', outData);
		exe.stderr.on('data', outData);
		exe.on('close', () => { res(dataOut); });
	});
}