import * as solc from "solc";
import * as path from "path";
import * as fs from "fs";
import axios from "axios";
import { RemixURLResolver } from "remix-url-resolver";


function handleLocal(pathString: string, filePath: any) {
	// if no relative/absolute path given then search in node_modules folder
	if (pathString && pathString.indexOf(".") !== 0 && pathString.indexOf("/") !== 0) {
		console.error("Error: Node Modules Import is not implemented yet!");
		// return handleNodeModulesImport(pathString, filePath, pathString)
		return;
	} else {
		try {
			const o = { encoding: "UTF-8" };
			// hack for compiler imports to work (do not change)
			const p = pathString ? path.resolve(pathString, filePath) : path.resolve(pathString, filePath);
			const content = fs.readFileSync(p, o);
			return content;
		} catch (error) {
			// @ts-ignore
			process.send({ error });
			throw error;
		}
	}
}

function findImports(path: any) {
	// TODO: We need current solc file path here for relative local import
	// @ts-ignore
	process.send({ processMessage: "importing file: " + path });
	const FSHandler = [
		{
			type: "local",
			match: (url: string) => {
				return /(^(?!(?:http:\/\/)|(?:https:\/\/)?(?:www.)?(?:github.com)))(^\/*[\w+-_/]*\/)*?(\w+\.sol)/g.exec(url);
			},
			handle: (match: Array<string>) => {
				return handleLocal(match[2], match[3]);
			}
		}
	];
	// @ts-ignore
	const urlResolver = new RemixURLResolver();
	// this section usually executes after solc returns error file not found
	urlResolver.resolve(path, FSHandler)
		.then((data: any) => {
			// @ts-ignore
			process.send({ data, path });
		})
		.catch((e: Error) => {
			// @ts-ignore
			process.send({ error: e });
		});
	return { 'error': 'Deferred import' };
}

process.on("message", async m => {
	if (m.command === "compile") {
		const vnReg = /(^[0-9].[0-9].[0-9]\+commit\..*?)+(\.)/g;
		const vnRegArr = vnReg.exec(solc.version());
		// @ts-ignore
		const vn = 'v' + (vnRegArr ? vnRegArr[1] : '');
		const input = m.payload;
		if (m.version === vn || m.version === 'latest') {
			try {
				console.log("compiling with local version: ", solc.version());
				const output = await solc.compile(JSON.stringify(input), { import: findImports });
				// @ts-ignore
				process.send({ compiled: output });
				// we should not exit process here as findImports still might be running
			} catch (e) {
				console.error(e);
				// @ts-ignore
				process.send({ error: e });
				// @ts-ignore
				process.exit(1);
			}
		} else if (m.version !== vn) {
			console.log("loading remote version " + m.version + "...");
			solc.loadRemoteVersion(m.version, async (err: Error, newSolc: any) => {
				if (err) {
					console.error(err);
					// @ts-ignore
					process.send({ error: e });
				} else {
					console.log("compiling with remote version ", newSolc.version());
					try {
						const output = await newSolc.compile(JSON.stringify(input), { import: findImports });
						// @ts-ignore
						process.send({ compiled: output });
					} catch (e) {
						console.error(e);
						// @ts-ignore
						process.send({ error: e });
						// @ts-ignore
						process.exit(1);
					}
				}
			});
		}
	}
	if (m.command === "fetch_compiler_verison") {
		axios
			.get("https://ethereum.github.io/solc-bin/bin/list.json")
			.then((res: any) => {
				// @ts-ignore
				process.send({ versions: res.data });
			})
			.catch((e: Error) => {
				// @ts-ignore
				process.send({ error: e });
				// @ts-ignore
				process.exit(1);
			});
	}
});